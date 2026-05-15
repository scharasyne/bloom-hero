"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/features/admin/actions/logActivity";
import type { AdminActionResult } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";

export async function rejectVendorApplication(
  applicationId: string,
  reason: string
): Promise<AdminActionResult> {
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
