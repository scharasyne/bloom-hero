"use server";

import type { AdminActionResult, ReviewModerationStatus } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { getAdminClient } from "@/features/admin/utils/reviewModeration";

export async function updateReviewStatus(
  reviewId: string,
  status: ReviewModerationStatus
): Promise<AdminActionResult> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const { error } = await adminClient.client.from("reviews").update({ status }).eq("id", reviewId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
