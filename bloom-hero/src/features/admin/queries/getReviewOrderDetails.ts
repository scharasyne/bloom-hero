"use server";

import type { AdminActionResult, ReviewOrderDetails } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { getAdminClient, pickSingle } from "@/features/admin/utils/reviewModeration";

export async function getReviewOrderDetails(
  orderId: string
): Promise<AdminActionResult<ReviewOrderDetails>> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const { data: order, error: orderError } = await adminClient.client
    .from("orders")
    .select(
      "id, status, order_date, total_amount, customer_id, vendors(shop_name), order_items(quantity, subtotal, products(product_name, product_image_url))"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Order not found." };
  }

  let customerName: string | null = null;
  if (order.customer_id) {
    const { data: user } = await adminClient.client
      .from("users")
      .select("name")
      .eq("id", order.customer_id)
      .maybeSingle();
    customerName = user?.name ?? null;
  }

  const vendor = pickSingle(order.vendors as Record<string, unknown> | Record<string, unknown>[]);
  const items = (order.order_items ?? []).map((item: Record<string, unknown>) => {
    const products = item.products as Record<string, unknown> | undefined;
    return {
      productName: (products?.product_name as string) ?? "Product",
      quantity: Number(item.quantity) || 0,
      subtotal: Number(item.subtotal) || 0,
      imageUrl: (products?.product_image_url as string | null) ?? null,
    };
  });

  return {
    ok: true,
    data: {
      id: order.id,
      status: order.status ?? "unknown",
      orderDate: new Date(order.order_date).toLocaleString(),
      totalAmount: Number(order.total_amount) || 0,
      vendorName: (vendor?.shop_name as string) ?? "Vendor",
      customerName,
      items,
    },
  };
}
