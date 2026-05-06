import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getOrderReviewEligibility(orderId: string, customerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, vendor_id")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getOrderForReviewByCustomer(orderId: string, customerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      order_date,
      customer_id,
      vendor_id,
      vendors!inner(id, shop_name),
      order_items!inner(
        quantity,
        subtotal,
        products(id, product_name, price, product_image_url)
      )
    `
    )
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getExistingReviewByCustomerAndVendor(customerId: string, vendorId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, updated_at")
    .eq("customer_id", customerId)
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function saveReviewByCustomer(input: {
  reviewId?: string;
  customerId: string;
  vendorId: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createSupabaseServerClient();
  const payload = {
    rating: input.rating,
    comment: input.comment.trim() || null,
  };

  if (input.reviewId) {
    const { error } = await supabase
      .from("reviews")
      .update(payload)
      .eq("id", input.reviewId)
      .eq("customer_id", input.customerId)
      .eq("vendor_id", input.vendorId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("reviews").insert({
    customer_id: input.customerId,
    vendor_id: input.vendorId,
    rating: input.rating,
    comment: input.comment.trim() || null,
  });
  if (error) throw new Error(error.message);
}
