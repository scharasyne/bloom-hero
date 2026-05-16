import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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