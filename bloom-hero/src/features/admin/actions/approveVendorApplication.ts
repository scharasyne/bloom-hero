"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { logActivity } from "@/features/admin/actions/logActivity";
import type { AdminActionResult, IssuedVendorCredentials } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import {
  createRandomPassword,
  normalizeEmail,
  type LinkedVendorCredentials,
} from "@/features/admin/utils/vendorApplicationApproval";
import type { DetailLine } from "@/types";

export async function approveVendorApplication(
  applicationId: string
): Promise<AdminActionResult<IssuedVendorCredentials>> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const { supabase, adminId } = adminCheck;

  const { data: application, error: applicationError } = await supabase
    .from("vendor_applications")
    .select("id, owner_id, shop_name, email, phone_number, business_type, submission_status")
    .eq("id", applicationId)
    .maybeSingle<{
      id: string;
      owner_id: string;
      shop_name: string | null;
      email: string | null;
      phone_number: string | null;
      business_type: "registered" | "unregistered" | null;
      submission_status: string | null;
    }>();

  if (applicationError || !application) {
    return { ok: false, error: applicationError?.message ?? "Vendor application not found." };
  }

  if (application.submission_status !== "submitted") {
    return { ok: false, error: "Only submitted applications can be approved." };
  }

  const businessEmail = normalizeEmail(application.email);
  if (!businessEmail) {
    return { ok: false, error: "Application must include a business email." };
  }

  const { data: applicantUser, error: applicantError } = await supabase
    .from("users")
    .select("email")
    .eq("id", application.owner_id)
    .maybeSingle<{ email: string | null }>();

  if (applicantError) {
    return { ok: false, error: applicantError.message };
  }

  if (businessEmail === normalizeEmail(applicantUser?.email)) {
    return {
      ok: false,
      error: "Business email must be different from the applicant account email.",
    };
  }

  const { data: emailTaken, error: emailLookupError } = await supabase
    .from("users")
    .select("id")
    .eq("email", businessEmail)
    .maybeSingle<{ id: string }>();

  if (emailLookupError) {
    return { ok: false, error: emailLookupError.message };
  }

  if (emailTaken?.id) {
    return {
      ok: false,
      error: "The business email is already used by another account.",
    };
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = createSupabaseAdminClient();
  } catch (error) {
    console.error("Failed to initialize Supabase admin client for vendor approval:", error);
    return {
      ok: false,
      error:
        "Vendor approval requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set in your environment.",
    };
  }

  const generatedPassword = createRandomPassword();

  const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email: businessEmail,
    password: generatedPassword,
    email_confirm: true,
    user_metadata: {
      role: "vendor",
      shop_name: application.shop_name,
      must_change_password: true,
    },
  });

  if (createUserError || !createdUser.user) {
    return { ok: false, error: createUserError?.message ?? "Failed to create vendor account." };
  }

  const vendorUserId = createdUser.user.id;
  const businessType = application.business_type ?? "registered";
  const issuedAt = new Date().toISOString();
  const vendorLabel = application.shop_name?.trim() || "Vendor Application";

  try {
    const { error: upsertUserError } = await supabase
      .from("users")
      .upsert(
        {
          id: vendorUserId,
          email: businessEmail,
          role: "vendor",
          contact_number: application.phone_number,
        },
        { onConflict: "id" }
      );

    if (upsertUserError) {
      throw new Error(upsertUserError.message);
    }

    const { error: customerError } = await supabase
      .from("customers")
      .upsert({ user_id: vendorUserId }, { onConflict: "user_id" });

    if (customerError) {
      throw new Error(customerError.message);
    }

    const { error: vendorError } = await supabase.from("vendors").upsert(
      {
        owner_id: vendorUserId,
        shop_name: application.shop_name?.trim() || "Vendor Shop",
        business_type: businessType,
        status: "approved",
      },
      { onConflict: "owner_id" }
    );

    if (vendorError) {
      throw new Error(vendorError.message);
    }

    const { data: applicantAuthUser, error: applicantAuthUserError } =
      await supabaseAdmin.auth.admin.getUserById(application.owner_id);

    if (applicantAuthUserError || !applicantAuthUser.user) {
      throw new Error(applicantAuthUserError?.message ?? "Failed to load applicant auth account.");
    }

    const previousMetadata =
      (applicantAuthUser.user.user_metadata as Record<string, unknown> | undefined) ?? {};

    const linkedVendorCredentials: LinkedVendorCredentials = {
      vendor_user_id: vendorUserId,
      email: businessEmail,
      password: generatedPassword,
      issued_at: issuedAt,
    };

    const { error: applicantMetadataError } = await supabaseAdmin.auth.admin.updateUserById(
      application.owner_id,
      {
        user_metadata: {
          ...previousMetadata,
          linked_vendor_credentials: linkedVendorCredentials,
        },
      }
    );

    if (applicantMetadataError) {
      throw new Error(applicantMetadataError.message);
    }

    const { error: applicationUpdateError } = await supabase
      .from("vendor_applications")
      .update({
        submission_status: "approved",
        approved_at: issuedAt,
        rejected_at: null,
        rejection_reason: null,
        approved_vendor_user_id: vendorUserId,
      })
      .eq("id", application.id);

    if (applicationUpdateError) {
      throw new Error(applicationUpdateError.message);
    }

    await logActivity({
      adminUserId: adminId,
      actionType: "approved",
      actionTitle: "Approved Vendor Application",
      targetId: application.id,
      targetName: vendorLabel,
      details: [
        { type: "info", text: `Business email: ${businessEmail}` },
        { type: "info", text: `Business type: ${businessType}` },
        { type: "info", text: `Vendor user created: ${vendorUserId}` },
      ] satisfies DetailLine[],
      tags: ["vendor-management", "approved"],
      quickLinks: [{ label: "View vendor applications", href: "/admin/vendor-applications" }],
      metadata: {
        application_id: application.id,
        vendor_user_id: vendorUserId,
        business_type: businessType,
      },
    }).catch((error) => {
      console.error("Failed to write approval activity log:", error);
    });
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(vendorUserId);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to finalize vendor approval.",
    };
  }

  revalidatePath("/admin/vendor-applications");

  return {
    ok: true,
    data: {
      userId: vendorUserId,
      email: businessEmail,
      password: generatedPassword,
    },
  };
}
