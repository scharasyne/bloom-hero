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

  revalidatePath("/customer/orders");
  revalidatePath("/customer/review");

  return { ok: true };
}
