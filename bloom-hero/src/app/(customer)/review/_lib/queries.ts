import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type OrderForReview = {
  id: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: Date;
  customerId: string;
  vendor: {
    id: string;
    shopName: string;
  };
  items: Array<{
    quantity: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    };
  }>;
};

export async function getOrderForReview(
  orderId: string,
  userId: string
): Promise<OrderForReview | null> {
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
    .eq("customer_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load order: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Transform to strongly typed structure
  return {
    id: data.id,
    status: data.status as "pending" | "processing" | "completed" | "cancelled",
    orderDate: new Date(data.order_date),
    customerId: data.customer_id,
    vendor: {
      id: data.vendors?.[0]?.id || "",
      shopName: data.vendors?.[0]?.shop_name || "Vendor",
    },
    items: (data.order_items || []).map((item: any) => ({
      quantity: item.quantity,
      subtotal: item.subtotal,
      product: {
        id: item.products?.id || "",
        name: item.products?.product_name || "Product",
        price: item.products?.price || 0,
        imageUrl: item.products?.product_image_url || null,
      },
    })),
  };
}

export async function getExistingReview(customerId: string, vendorId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, updated_at")
    .eq("customer_id", customerId)
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load review: ${error.message}`);
  }

  return data ?? null;
}
