import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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