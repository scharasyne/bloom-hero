"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { PopUpVendorProfileData } from "../types";

export async function getPopUpVendorProfileData(): Promise<PopUpVendorProfileData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string }>();

  if (vendorError || !vendor) {
    throw new Error(vendorError?.message || "Pop-up vendor profile not found.");
  }

  const { data: scheduleRows, error: scheduleError } = await supabase
    .from("popup_locations")
    .select("id, location, scheduled_date, start_time, end_time")
    .eq("vendor_id", vendor.id)
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (scheduleError) {
    throw new Error(scheduleError.message);
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_id, rating, comment, review_date")
    .eq("vendor_id", vendor.id)
    .order("review_date", { ascending: false });

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  const reviewerIds = Array.from(new Set((reviewRows ?? []).map((review) => review.customer_id)));
  const { data: reviewerRows } = reviewerIds.length
    ? await supabase.from("users").select("id, name, email").in("id", reviewerIds)
    : { data: [] };

  const reviewerMap = new Map(
    (reviewerRows ?? []).map((row) => [row.id, row.name?.trim() || row.email || "Customer"])
  );

  return {
    vendorId: vendor.id,
    aboutText: "Tell customers more about your pop-up concept and services.",
    schedules: (scheduleRows ?? []).map((row) => ({
      id: row.id,
      location: row.location || "Location pending",
      scheduledDate: row.scheduled_date,
      startTime: row.start_time,
      endTime: row.end_time,
    })),
    reviews: (reviewRows ?? []).map((review) => ({
      id: review.id,
      customerId: review.customer_id,
      customerName: reviewerMap.get(review.customer_id) ?? "Customer",
      rating: review.rating,
      comment: review.comment?.trim() || "Customer left a rating.",
      reviewDate: review.review_date,
    })),
  };
}
