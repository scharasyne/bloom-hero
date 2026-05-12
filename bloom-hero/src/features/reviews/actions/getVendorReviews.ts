import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getVendorReviews(vendorId: string): Promise<VendorReview[]> {
  const supabase = await createSupabaseServerClient();
  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_id, rating, comment, review_date")
    .eq("vendor_id", vendorId)
    .order("review_date", { ascending: false });

  if (reviewError) {
    console.error("Error fetching reviews:", reviewError);
    return [];
  }

  const reviewerIds = Array.from(
    new Set((reviewRows ?? []).map((review) => review.customer_id).filter(Boolean))
  );
  const { data: reviewerRows } = reviewerIds.length
    ? await supabase.from("users").select("id, name, email").in("id", reviewerIds)
    : { data: [] };

  const reviewerMap = new Map(
    (reviewerRows ?? []).map((row) => [row.id, row.name?.trim() || row.email || "Customer"])
  );

  const now = Date.now();
  return (reviewRows ?? []).map((review) => {
    const reviewTimestamp = review.review_date ? new Date(review.review_date).getTime() : now;
    const diffMs = Math.max(0, now - reviewTimestamp);
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return {
      id: review.id,
      name: reviewerMap.get(review.customer_id) ?? "Customer",
      comment: review.comment?.trim() || "Customer left a rating.",
      rating: Number(review.rating) || 0,
      daysAgo,
    };
  });
}