"use server";

import type { AdminActionResult, ReviewModerationRecord } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { getAdminClient, pickSingle } from "@/features/admin/utils/reviewModeration";

type GetReviewModerationReviewsOptions = {
  /** Dev/QA only: return a failed result without hitting the database. */
  simulateError?: boolean;
};

export async function getReviewModerationReviews(
  options?: GetReviewModerationReviewsOptions
): Promise<AdminActionResult<ReviewModerationRecord[]>> {
  if (options?.simulateError) {
    return {
      ok: false,
      error: "Simulated load failure for testing. Click Retry to load real reviews.",
    };
  }

  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const { data: reviewRows, error: reviewError } = await adminClient.client
    .from("reviews")
    .select(
      "id, rating, comment, review_date, status, order_id, product_id, customer_id, vendor_id, products(product_name, product_image_url), vendors(shop_name)"
    )
    .order("review_date", { ascending: false });

  if (reviewError) {
    return { ok: false, error: reviewError.message };
  }

  const rows = reviewRows ?? [];
  const customerIds = Array.from(new Set(rows.map((row) => row.customer_id).filter(Boolean)));
  let customerNames = new Map<string, string>();

  if (customerIds.length > 0) {
    const { data: users, error: usersError } = await adminClient.client
      .from("users")
      .select("id, name")
      .in("id", customerIds);

    if (usersError) {
      return { ok: false, error: usersError.message };
    }

    customerNames = new Map((users ?? []).map((user) => [user.id, user.name ?? "Customer"]));
  }

  const reviews: ReviewModerationRecord[] = rows.map((row: Record<string, unknown>) => {
    const vendor = pickSingle(row.vendors as Record<string, unknown> | Record<string, unknown>[]);
    const product = pickSingle(row.products as Record<string, unknown> | Record<string, unknown>[]);

    return {
      id: row.id as string,
      rating: Number(row.rating) || 0,
      comment: (row.comment as string | null) ?? null,
      reviewDate: row.review_date as string,
      status: ((row.status as string) ?? "pending") as ReviewModerationRecord["status"],
      orderId: (row.order_id as string | null) ?? null,
      customerName: customerNames.get(row.customer_id as string) ?? "Customer",
      vendorName: (vendor?.shop_name as string) ?? "Vendor",
      productName: (product?.product_name as string) ?? "Product",
      productImageUrl: (product?.product_image_url as string | null) ?? null,
    };
  });

  return { ok: true, data: reviews };
}
