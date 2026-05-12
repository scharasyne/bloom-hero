"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { logActivity } from "@/app/admin/actions/activity-log";
import { DetailLine } from "@/types";
import { listSubmittedVendorApplications } from "@/features/vendors/queries/listSubmittedVendorApplications";
import { VendorApplicationRecord } from "@/types";

type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export type IssuedVendorCredentials = {
  userId: string;
  email: string;
  password: string;
};

type LinkedVendorCredentials = {
  vendor_user_id: string;
  email: string;
  password: string;
  issued_at: string;
};

type AdminCheckResult =
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      adminId: string;
      error: null;
    }
  | {
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
      adminId: null;
      error: string;
    };

function normalizeEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function createRandomPassword(length = 16) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => charset[byte % charset.length]).join("");
}

async function ensureAdmin(): Promise<AdminCheckResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, adminId: null, error: "You must be logged in as an admin." };
  }

  const { data: profile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (roleError || profile?.role !== "admin") {
    return { supabase, adminId: null, error: "Only admins can manage vendor applications." };
  }

  return { supabase, adminId: user.id, error: null };
}

export async function approveVendorApplication(
  applicationId: string
): Promise<ActionResult<IssuedVendorCredentials>> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const { supabase, adminId } = adminCheck;

  const { data: application, error: applicationError } = await supabase
    .from("vendor_applications")
    .select("id, owner_id, shop_name, email, phone_number, vendor_type, submission_status")
    .eq("id", applicationId)
    .maybeSingle<{
      id: string;
      owner_id: string;
      shop_name: string | null;
      email: string | null;
      phone_number: string | null;
      vendor_type: "market" | "pop-up" | null;
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
  const vendorType = application.vendor_type ?? "market";
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
        vendor_type: vendorType,
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
        { type: "info", text: `Vendor type: ${vendorType}` },
        { type: "info", text: `Vendor user created: ${vendorUserId}` },
      ] satisfies DetailLine[],
      tags: ["vendor-management", "approved"],
      quickLinks: [{ label: "View vendor applications", href: "/admin/vendor-applications" }],
      metadata: {
        application_id: application.id,
        vendor_user_id: vendorUserId,
        vendor_type: vendorType,
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

export async function getSubmittedVendorApplications(): Promise<ActionResult<VendorApplicationRecord[]>> {
  const adminCheck = await ensureAdmin();
  if (adminCheck.error) {
    return { ok: false, error: adminCheck.error };
  }

  try {
    const data = await listSubmittedVendorApplications();
    return { ok: true, data: data as VendorApplicationRecord[] };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load vendor applications.",
    };
  }
}

export async function rejectVendorApplication(
  applicationId: string,
  reason: string
): Promise<ActionResult> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const { supabase, adminId } = adminCheck;

  const rejectionReason = reason.trim() || "Rejected by admin";

  const { data: application, error: applicationError } = await supabase
    .from("vendor_applications")
    .select("id, shop_name, submission_status")
    .eq("id", applicationId)
    .maybeSingle<{ id: string; shop_name: string | null; submission_status: string | null }>();

  if (applicationError || !application) {
    return { ok: false, error: applicationError?.message ?? "Vendor application not found." };
  }

  if (application.submission_status !== "submitted") {
    return { ok: false, error: "Only submitted applications can be rejected." };
  }

  const { error: updateError } = await supabase
    .from("vendor_applications")
    .update({
      submission_status: "rejected",
      rejection_reason: rejectionReason,
      rejected_at: new Date().toISOString(),
      approved_at: null,
      approved_vendor_user_id: null,
    })
    .eq("id", application.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await logActivity({
    adminUserId: adminId,
    actionType: "rejected",
    actionTitle: "Rejected Vendor Application",
    targetId: application.id,
    targetName: application.shop_name?.trim() || "Vendor Application",
    details: [{ type: "reason", text: rejectionReason }],
    tags: ["vendor-management", "rejected"],
    quickLinks: [{ label: "View vendor applications", href: "/admin/vendor-applications" }],
    metadata: {
      application_id: application.id,
      rejection_reason: rejectionReason,
    },
  }).catch((error) => {
    console.error("Failed to write rejection activity log:", error);
  });

  revalidatePath("/admin/vendor-applications");

  return { ok: true };
}
