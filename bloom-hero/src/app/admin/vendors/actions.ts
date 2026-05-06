"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { logActivity } from "@/app/admin/actions/activity-log";

type ActionResult = {
  ok: boolean;
  error?: string;
};

async function ensureAdmin() {
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
    return { supabase, adminId: null, error: "Only admins can manage vendors." };
  }

  return { supabase, adminId: user.id, error: null };
}

export async function setVendorSuspensionStatus(
  vendorId: string,
  shouldSuspend: boolean,
  reason?: string
): Promise<ActionResult> {
  const adminCheck = await ensureAdmin();
  if (adminCheck.error || !adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "Admin authorization failed." };
  }

  const { supabase, adminId } = adminCheck;

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, owner_id, shop_name, status, suspended_at")
    .eq("id", vendorId)
    .maybeSingle<{
      id: string;
      owner_id: string;
      shop_name: string | null;
      status: string | null;
      suspended_at: string | null;
    }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor not found." };
  }

  const suspensionReason = reason?.trim() ?? "";
  if (shouldSuspend && !suspensionReason) {
    return { ok: false, error: "Suspension reason is required." };
  }

  const { error: updateError } = await supabase
    .from("vendors")
    .update({
      suspended_at: shouldSuspend ? new Date().toISOString() : null,
      suspended_by_admin_id: shouldSuspend ? adminId : null,
      suspension_reason: shouldSuspend ? suspensionReason : null,
    })
    .eq("id", vendor.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await logActivity({
    adminUserId: adminId,
    actionType: shouldSuspend ? "suspended" : "unsuspended",
    actionTitle: shouldSuspend ? "Suspended Vendor Account" : "Unsuspended Vendor Account",
    targetId: vendor.id,
    targetName: vendor.shop_name?.trim() || "Vendor",
    details: shouldSuspend
      ? [{ type: "reason", text: `Reason: ${suspensionReason}` }]
      : [{ type: "info", text: "Vendor account restored to active status." }],
    tags: shouldSuspend
      ? ["vendor-management", "suspension"]
      : ["vendor-management", "unsuspension"],
    quickLinks: [{ label: "View vendors", href: "/admin/vendors" }],
    metadata: {
      vendor_id: vendor.id,
      owner_id: vendor.owner_id,
      previous_status: vendor.status,
      was_suspended: Boolean(vendor.suspended_at),
      is_suspended: shouldSuspend,
      reason: shouldSuspend ? suspensionReason : null,
    },
  }).catch((error) => {
    console.error("Failed to write vendor suspension activity log:", error);
  });

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/activity-logs");

  return { ok: true };
}