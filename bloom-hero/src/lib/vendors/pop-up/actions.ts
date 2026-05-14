"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type PopUpProfileSchedule = {
  id: string;
  location: string;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
};

export type PopUpProfileReview = {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  reviewDate: string | null;
};

export type PopUpVendorProfileData = {
  vendorId: string;
  schedules: PopUpProfileSchedule[];
  reviews: PopUpProfileReview[];
  aboutText: string;
};

type ActionResult = { ok: boolean; error?: string };

function toIsoDateTime(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

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

export async function createPopUpProfileSchedule(input: {
  location: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
}): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be logged in." };

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor profile not found." };
  }

  const cleanLocation = input.location.trim();
  if (!cleanLocation || !input.scheduledDate) {
    return { ok: false, error: "Location and date are required." };
  }

  const scheduledDateIso = toIsoDateTime(input.scheduledDate, "00:00");
  const startTimeIso = input.startTime ? toIsoDateTime(input.scheduledDate, input.startTime) : null;
  const endTimeIso = input.endTime ? toIsoDateTime(input.scheduledDate, input.endTime) : null;
  if (!scheduledDateIso) {
    return { ok: false, error: "Invalid schedule date." };
  }

  const { error } = await supabase.from("popup_locations").insert({
    vendor_id: vendor.id,
    location: cleanLocation,
    scheduled_date: scheduledDateIso,
    start_time: startTimeIso,
    end_time: endTimeIso,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/pop-up/profile");
  return { ok: true };
}
