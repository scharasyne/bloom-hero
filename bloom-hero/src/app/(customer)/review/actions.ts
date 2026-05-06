"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getOrderReviewEligibility, saveReviewByCustomer } from "@/lib/services/reviews";

type SubmitReviewInput = {
  orderId: string;
  vendorId: string;
  rating: number;
  comment: string;
  reviewId?: string;
};
export type ReviewOrder = {
  id: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  orderDate: string;
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

export type ReviewPageData = {
  order: ReviewOrder;
  existingReview: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
};

export type ReviewPageResult =
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | { status: "ready"; data: ReviewPageData };

type SubmitReviewResult = {
  ok: boolean;
  error?: string;
};

export async function loadReviewPage(orderId: string): Promise<ReviewPageResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { status: "unauthenticated" };
  }

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
    .eq("customer_id", session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load order: ${error.message}`);
  }

  if (!data) {
    return { status: "not-found" };
  }

  const vendorId = data.vendor_id || data.vendors?.[0]?.id || "";

  let existingReview: ReviewPageData["existingReview"] = null;
  if (vendorId) {
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, rating, comment")
      .eq("customer_id", session.user.id)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (reviewError) {
      throw new Error(`Failed to load review: ${reviewError.message}`);
    }

    existingReview = review ?? null;
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
export async function submitCustomerReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { ok: false, error: "You must be logged in." };
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }

  let order;
  try {
    order = await getOrderReviewEligibility(input.orderId, session.user.id);
  } catch {
    return { ok: false, error: "Unable to validate this order right now." };
  }

  if (!order) {
    return { ok: false, error: "Order not found for this account." };
  }

  if (order.status !== "completed") {
    return { ok: false, error: "You can only review completed orders." };
  }

  if (order.vendor_id !== input.vendorId) {
    return { ok: false, error: "Vendor mismatch for this order." };
  }

  try {
    await saveReviewByCustomer({
      reviewId: input.reviewId,
      customerId: session.user.id,
      vendorId: input.vendorId,
      rating: input.rating,
      comment: input.comment,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message || "Failed to save review." : "Failed to save review.",
    };
  }

  revalidatePath("/orders");

  return { ok: true };
}
