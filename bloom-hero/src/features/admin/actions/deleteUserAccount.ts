"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/features/admin/actions/logActivity";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { deleteAuthUserById } from "@/lib/auth/deleteAuthUserById";
import type { AdminActionResult } from "@/features/admin/types";

export async function deleteUserAccount(
  targetUserId: string,
  reason?: string
): Promise<AdminActionResult> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "Admin authorization failed." };
  }

  if (targetUserId === adminCheck.adminId) {
    return { ok: false, error: "You cannot delete your own admin account." };
  }

  const { supabase } = adminCheck;
  const { data: target, error: targetError } = await supabase
    .from("users")
    .select("id, email, name, role")
    .eq("id", targetUserId)
    .maybeSingle<{
      id: string;
      email: string;
      name: string | null;
      role: string | null;
    }>();

  if (targetError) {
    return { ok: false, error: targetError.message };
  }
  if (!target) {
    return { ok: false, error: "User not found." };
  }
  if (target.role === "admin") {
    return { ok: false, error: "Admin accounts cannot be deleted." };
  }

  const deleted = await deleteAuthUserById(targetUserId);
  if (!deleted.ok) {
    return { ok: false, error: deleted.error };
  }

  const label = target.name?.trim() || target.email;
  await logActivity({
    adminUserId: adminCheck.adminId,
    actionType: "rejected",
    actionTitle: "Deleted User Account",
    targetId: targetUserId,
    targetName: label,
    details: [
      { type: "info", text: `Email: ${target.email}` },
      { type: "info", text: `Role: ${target.role ?? "unknown"}` },
      ...(reason?.trim() ? [{ type: "info" as const, text: `Reason: ${reason.trim()}` }] : []),
    ],
    tags: ["user-management", "deleted"],
    quickLinks: [{ label: "View vendors", href: "/admin/vendors" }],
    metadata: { deleted_user_id: targetUserId, deleted_email: target.email },
  }).catch((error) => {
    console.error("Failed to log user deletion:", error);
  });

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/vendor-applications");
  return { ok: true };
}
