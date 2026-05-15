"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ActionResult, VendorReviewData } from "../types";

export async function updateVendorReviewByOwner(input: {
  reviewId: string;
  rating: number;
  comment: string;
}): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor profile not found." };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating: input.rating,
      comment: input.comment.trim() || null,
    })
    .eq("id", input.reviewId)
    .eq("vendor_id", vendor.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/vendor/profile");
  return { ok: true };
}
