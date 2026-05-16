import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { getAdminClient } from "@/features/admin/utils/reviewModeration";
import type { AdminNavAlertCounts } from "@/features/admin/types";

export async function getAdminNavAlertCounts(): Promise<AdminNavAlertCounts> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return {
      pendingApplications: 0,
      pendingReviews: 0,
      suspendedVendors: 0,
      pendingAppeals: 0,
    };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return {
      pendingApplications: 0,
      pendingReviews: 0,
      suspendedVendors: 0,
      pendingAppeals: 0,
    };
  }

  const [applications, reviews, suspended, appeals] = await Promise.all([
    adminClient.client
      .from("vendor_applications")
      .select("id", { count: "exact", head: true })
      .eq("submission_status", "submitted"),
    adminClient.client
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient.client
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .not("suspended_at", "is", null),
    adminClient.client
      .from("vendor_suspension_appeals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    pendingApplications: applications.count ?? 0,
    pendingReviews: reviews.count ?? 0,
    suspendedVendors: suspended.count ?? 0,
    pendingAppeals: appeals.count ?? 0,
  };
}
