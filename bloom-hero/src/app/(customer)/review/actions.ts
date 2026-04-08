"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type SubmitReviewInput = {
  orderId: string;
  vendorId: string;
  rating: number;
  comment: string;
  reviewId?: string;
};

type SubmitReviewResult = {
  ok: boolean;
  error?: string;
};

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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, vendor_id")
    .eq("id", input.orderId)
    .eq("customer_id", session.user.id)
    .maybeSingle();

  if (orderError) {
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

  const payload = {
    rating: input.rating,
    comment: input.comment.trim() || null,
  };

  let writeError: { message: string } | null = null;

  if (input.reviewId) {
    const { error } = await supabase
      .from("reviews")
      .update(payload)
      .eq("id", input.reviewId)
      .eq("customer_id", session.user.id)
      .eq("vendor_id", input.vendorId);
    writeError = error;
  } else {
    const { error } = await supabase.from("reviews").insert({
      customer_id: session.user.id,
      vendor_id: input.vendorId,
      rating: input.rating,
      comment: input.comment.trim() || null,
    });
    writeError = error;
  }

  if (writeError) {
    return { ok: false, error: writeError.message || "Failed to save review." };
  }

  revalidatePath("/customer/orders");
  revalidatePath("/customer/review");

  return { ok: true };
}
