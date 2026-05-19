// Source: `src/app/(customer)/review/actions.ts` (loadReviewPage only)

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getExistingReviewByCustomerAndOrder } from "@/features/reviews/queries/getExistingReview";
import type { ReviewOrder, ReviewPageData, ReviewPageResult } from "@/features/reviews/types";

export async function loadReviewPage(orderId: string): Promise<ReviewPageResult> {
  const user = await getAuthUser();
  if (!user) {
    return { status: "unauthenticated" };
  }

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
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load order: ${error.message}`);
  }

  if (!data) {
    return { status: "not-found" };
  }

  const vendorId = data.vendor_id || data.vendors?.[0]?.id || "";
  const firstItem = data.order_items?.[0];
  const firstProduct = Array.isArray(firstItem?.products)
    ? firstItem?.products?.[0]
    : firstItem?.products;
  const productId = firstProduct?.id || "";

  let existingReview: ReviewPageData["existingReview"] = null;
  if (productId) {
    const review = await getExistingReviewByCustomerAndOrder(user.id, data.id, productId);
    existingReview = review ? { id: review.id, rating: review.rating, comment: review.comment } : null;
  }

  return {
    status: "ready",
    data: {
      order: {
        id: data.id,
        status: data.status as ReviewOrder["status"],
        orderDate: new Date(data.order_date).toISOString(),
        customerId: data.customer_id,
        vendor: {
          id: vendorId,
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
      },
      existingReview,
    },
  };
}
