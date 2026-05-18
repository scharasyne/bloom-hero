// Origin: src/lib/products.ts

import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";
import type { ProductReviewRow } from "../types";

export async function getProductReviewsByProductId(productId: string) {
  const supabase = await createPublicCatalogSupabaseClient();

  if (!productId || productId.trim() === "") {
    console.warn("getProductReviewsByProductId: productId is empty or missing");
    return { data: [] as ProductReviewRow[], error: null };
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_id, rating, comment, review_date, status")
    .eq("product_id", productId)
    .or("status.is.null,status.neq.rejected")
    .order("review_date", { ascending: false });

  if (reviewError) {
    console.error("getProductReviewsByProductId Supabase error:", reviewError.message || JSON.stringify(reviewError));
    return { data: [] as ProductReviewRow[], error: reviewError };
  }

  const customerIds = Array.from(
    new Set((reviewRows ?? []).map((review) => review.customer_id).filter(Boolean))
  );

  let customerNames = new Map<string, string>();

  if (customerIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name")
      .in("id", customerIds);

    if (usersError) {
      return { data: [] as ProductReviewRow[], error: usersError };
    }

    customerNames = new Map(
      (users ?? []).map((user) => [user.id, user.name ?? "Customer"])
    );
  }

  const reviews = (reviewRows ?? []).map((review) => ({
    id: review.id,
    customerId: review.customer_id,
    customerName: customerNames.get(review.customer_id) ?? "Customer",
    rating: Number(review.rating) || 0,
    comment: review.comment ?? null,
    reviewDate: review.review_date,
    status: (review as { status?: ProductReviewRow["status"] }).status ?? null,
  }));

  return { data: reviews, error: null };
}