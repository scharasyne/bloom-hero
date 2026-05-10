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