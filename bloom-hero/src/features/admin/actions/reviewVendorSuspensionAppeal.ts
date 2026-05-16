"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/features/admin/actions/logActivity";
import type { AdminActionResult } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { getAdminClient } from "@/features/admin/utils/reviewModeration";

export async function reviewVendorSuspensionAppeal(
  appealId: string,
  decision: "approved" | "rejected",
  adminResponse?: string
): Promise<AdminActionResult> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "Admin authorization failed." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const responseText = adminResponse?.trim() || null;

  const { data: appeal, error: appealError } = await adminClient.client
    .from("vendor_suspension_appeals")
    .select("id, vendor_id, owner_id, appeal_message, status, vendors(shop_name)")
    .eq("id", appealId)
    .maybeSingle();

  if (appealError || !appeal) {
    return { ok: false, error: appealError?.message ?? "Appeal not found." };
  }

  if (appeal.status !== "pending") {
    return { ok: false, error: "This appeal has already been reviewed." };
  }

  const vendor = Array.isArray(appeal.vendors) ? appeal.vendors[0] : appeal.vendors;
  const shopName = (vendor as { shop_name?: string | null })?.shop_name?.trim() || "Vendor";
  const reviewedAt = new Date().toISOString();

  if (decision === "approved") {
    const { error: vendorError } = await adminClient.client
      .from("vendors")
      .update({
        suspended_at: null,
        suspended_by_admin_id: null,
        suspension_reason: null,
      })
      .eq("id", appeal.vendor_id);

    if (vendorError) {
      return { ok: false, error: vendorError.message };
    }
  }

  const { error: appealUpdateError } = await adminClient.client
    .from("vendor_suspension_appeals")
    .update({
      status: decision,
      admin_response: responseText,
      reviewed_by_admin_id: adminCheck.adminId,
      reviewed_at: reviewedAt,
      updated_at: reviewedAt,
    })
    .eq("id", appeal.id);

  if (appealUpdateError) {
    return { ok: false, error: appealUpdateError.message };
  }

  await logActivity({
    adminUserId: adminCheck.adminId,
    actionType: decision === "approved" ? "unsuspended" : "rejected",
    actionTitle:
      decision === "approved" ? "Approved Suspension Appeal" : "Rejected Suspension Appeal",
    targetId: appeal.id,
    targetName: shopName,
    details: [
      { type: "info", text: appeal.appeal_message },
      ...(responseText ? [{ type: "reason" as const, text: responseText }] : []),
    ],
    tags: ["vendor-management", "suspension-appeal", decision],
    quickLinks: [
      { label: "View vendors", href: "/admin/vendors" },
      { label: "View vendors", href: "/admin/vendors" },
    ],
    metadata: {
      appeal_id: appeal.id,
      vendor_id: appeal.vendor_id,
      decision,
    },
  }).catch((error) => {
    console.error("Failed to write appeal review activity log:", error);
  });

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/dashboard");
  revalidatePath("/vendor", "layout");

  return { ok: true };
}
