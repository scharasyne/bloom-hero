import { REVENUE_TAKE_RATE } from "@/features/admin/utils/adminDashboardConstants";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { getAdminClient } from "@/features/admin/utils/reviewModeration";
import type {
  AdminDashboardData,
  AdminDashboardModerationItem,
  AdminDashboardSuspendedVendor,
} from "@/features/admin/types";

function monthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function pickSingle<T extends Record<string, unknown>>(
  value: T | T[] | null | undefined
): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData | null> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) return null;

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    throw new Error(adminClient.error ?? "Admin client unavailable.");
  }

  const monthStart = monthStartIso();

  const [
    ordersResult,
    applicationsResult,
    pendingApplicationsCountResult,
    reviewsResult,
    pendingReviewsCountResult,
    suspendedCountResult,
    suspendedVendorsResult,
  ] = await Promise.all([
    adminClient.client
      .from("orders")
      .select("total_amount, status, order_date")
      .gte("order_date", monthStart)
      .neq("status", "cancelled")
      .neq("status", "pending"),
    adminClient.client
      .from("vendor_applications")
      .select("id, shop_name, shop_address, email, submitted_at, created_at")
      .eq("submission_status", "submitted")
      .order("submitted_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    adminClient.client
      .from("vendor_applications")
      .select("id", { count: "exact", head: true })
      .eq("submission_status", "submitted"),
    adminClient.client
      .from("reviews")
      .select(
        "id, comment, review_date, status, customer_id, products(product_name), vendors(shop_name)"
      )
      .eq("status", "pending")
      .order("review_date", { ascending: false })
      .limit(8),
    adminClient.client
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient.client
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .not("suspended_at", "is", null),
    adminClient.client
      .from("vendors")
      .select("id, shop_name, suspension_reason, suspended_at")
      .not("suspended_at", "is", null)
      .order("suspended_at", { ascending: false })
      .limit(5),
  ]);

  if (ordersResult.error) throw new Error(ordersResult.error.message);
  if (applicationsResult.error) throw new Error(applicationsResult.error.message);
  if (pendingApplicationsCountResult.error) {
    throw new Error(pendingApplicationsCountResult.error.message);
  }
  if (reviewsResult.error) throw new Error(reviewsResult.error.message);
  if (pendingReviewsCountResult.error) throw new Error(pendingReviewsCountResult.error.message);
  if (suspendedCountResult.error) throw new Error(suspendedCountResult.error.message);
  if (suspendedVendorsResult.error) throw new Error(suspendedVendorsResult.error.message);

  const orders = ordersResult.data ?? [];
  const ordersProcessedThisMonth = orders.length;
  const orderVolume = orders.reduce((sum, row) => sum + (Number(row.total_amount) || 0), 0);
  const platformCommissionThisMonth = orderVolume * REVENUE_TAKE_RATE;

  const applications = applicationsResult.data ?? [];
  const reviewRows = reviewsResult.data ?? [];

  const reviewerIds = Array.from(
    new Set(reviewRows.map((row) => row.customer_id).filter(Boolean))
  ) as string[];

  let reviewerNames = new Map<string, string>();
  if (reviewerIds.length > 0) {
    const { data: reviewers, error: reviewersError } = await adminClient.client
      .from("users")
      .select("id, name, email")
      .in("id", reviewerIds);

    if (reviewersError) throw new Error(reviewersError.message);

    reviewerNames = new Map(
      (reviewers ?? []).map((user) => [
        user.id,
        user.name?.trim() || user.email?.trim() || "Customer",
      ])
    );
  }

  const applicationItems: AdminDashboardModerationItem[] = applications.map((row) => ({
    id: row.id,
    kind: "application",
    title: row.shop_name?.trim() || "Vendor application",
    meta: `Vendor application • ${row.shop_address?.trim() || row.email?.trim() || "No address"}`,
    statusLabel: "Approve",
    tone: "warning",
    href: "/admin/vendor-applications",
    sortAt: row.submitted_at ?? row.created_at ?? new Date(0).toISOString(),
  }));

  const reviewItems: AdminDashboardModerationItem[] = reviewRows.map((row) => {
    const product = pickSingle(row.products as Record<string, unknown> | Record<string, unknown>[]);
    const vendor = pickSingle(row.vendors as Record<string, unknown> | Record<string, unknown>[]);
    const customerName = reviewerNames.get(row.customer_id as string) ?? "Customer";

    return {
      id: row.id as string,
      kind: "review",
      title: customerName,
      meta: `Review • ${(product?.product_name as string) ?? "Product"} • ${(vendor?.shop_name as string) ?? "Vendor"}`,
      statusLabel: "Moderate",
      tone: "neutral",
      href: "/admin/review-moderation",
      sortAt: (row.review_date as string) ?? new Date(0).toISOString(),
    };
  });

  const moderationQueue = [...applicationItems, ...reviewItems]
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .slice(0, 6);

  const suspendedVendors: AdminDashboardSuspendedVendor[] = (suspendedVendorsResult.data ?? []).map(
    (row) => ({
      id: row.id,
      name: row.shop_name?.trim() || "Vendor",
      reason: row.suspension_reason?.trim() || "Suspended by admin",
    })
  );

  const pendingApplicationCount = pendingApplicationsCountResult.count ?? 0;
  const pendingReviewCount = pendingReviewsCountResult.count ?? 0;

  return {
    ordersProcessedThisMonth,
    platformCommissionThisMonth,
    pendingApplicationCount,
    pendingReviewCount,
    suspendedVendorCount: suspendedCountResult.count ?? suspendedVendors.length,
    moderationQueue,
    suspendedVendors,
    reviewQueueHref:
      pendingApplicationCount > 0 ? "/admin/vendor-applications" : "/admin/review-moderation",
  };
}
