import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getOrderReviewEligibility(orderId: string, customerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, vendor_id, order_items(product_id)")
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

export async function getExistingReviewByCustomerAndOrder(
  customerId: string,
  orderId: string,
  productId: string
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, status")
    .eq("customer_id", customerId)
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

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
