import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function saveReviewByCustomer(input: {
  reviewId?: string;
  customerId: string;
  vendorId: string;
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createSupabaseServerClient();
  const payload = {
    rating: input.rating,
    comment: input.comment.trim() || null,
    status: "pending",
    order_id: input.orderId,
    product_id: input.productId,
  };

  if (input.reviewId) {
    const { error } = await supabase
      .from("reviews")
      .update(payload)
      .eq("id", input.reviewId)
      .eq("customer_id", input.customerId)
      .eq("vendor_id", input.vendorId)
      .eq("order_id", input.orderId)
      .eq("product_id", input.productId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("reviews").insert({
    customer_id: input.customerId,
    vendor_id: input.vendorId,
    order_id: input.orderId,
    product_id: input.productId,
    rating: input.rating,
    comment: input.comment.trim() || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}
