"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface Product {
  id: string;
  product_name: string;
  product_image_url: string | null;
  product_images?: { image_url: string; display_order: number }[] | null;
  description: string | null;
  price: number;
}

interface PopUpSchedule {
  id: string;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PopUpGalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  location: string | null;
  event_name: string | null;
}

interface Vendor {
  id: string;
  shop_name: string;
  about?: string | null;
  location_text?: string | null;
  phone_number?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
}

export interface VendorReview {
  id: string;
  name: string;
  comment: string;
  rating: number;
  daysAgo: number;
}

export async function getVendorProfile(vendorId: string): Promise<Vendor | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("id, shop_name, about, location_text, phone_number, opens_at, closes_at")
    .eq("id", vendorId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching vendor:", error);
    return null;
  }

  return data || null;
}

export async function getVendorReviews(vendorId: string): Promise<VendorReview[]> {
  const supabase = await createSupabaseServerClient();
  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, customer_id, rating, comment, review_date")
    .eq("vendor_id", vendorId)
    .order("review_date", { ascending: false });

  if (reviewError) {
    console.error("Error fetching reviews:", reviewError);
    return [];
  }

  const reviewerIds = Array.from(
    new Set((reviewRows ?? []).map((review) => review.customer_id).filter(Boolean))
  );
  const { data: reviewerRows } = reviewerIds.length
    ? await supabase.from("users").select("id, name, email").in("id", reviewerIds)
    : { data: [] };

  const reviewerMap = new Map(
    (reviewerRows ?? []).map((row) => [row.id, row.name?.trim() || row.email || "Customer"])
  );

  const now = Date.now();
  return (reviewRows ?? []).map((review) => {
    const reviewTimestamp = review.review_date ? new Date(review.review_date).getTime() : now;
    const diffMs = Math.max(0, now - reviewTimestamp);
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return {
      id: review.id,
      name: reviewerMap.get(review.customer_id) ?? "Customer",
      comment: review.comment?.trim() || "Customer left a rating.",
      rating: Number(review.rating) || 0,
      daysAgo,
    };
  });
}

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, product_name, product_image_url, description, price, product_images(image_url, display_order)"
    )
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data as Product[]) || [];
}

export async function getPopUpSchedule(vendorId: string): Promise<PopUpSchedule[]> {
  const supabase = await createSupabaseServerClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("popup_locations")
    .select("id, location, scheduled_date, start_time, end_time, latitude, longitude")
    .eq("vendor_id", vendorId)
    .gte("scheduled_date", startOfToday.toISOString())
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching pop-up schedule:", error);
    return [];
  }

  return (data as PopUpSchedule[]) || [];
}

export async function getPopUpGalleryPhotosByVendor(
  vendorId: string
): Promise<PopUpGalleryPhoto[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("popup_gallery_photos")
    .select("id, image_url, caption, location, event_name, display_order, created_at")
    .eq("vendor_id", vendorId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pop-up gallery:", error);
    return [];
  }

  return (data as PopUpGalleryPhoto[]) || [];
}

export type RequestedLocationRank = {
  location: string;
  count: number;
};

export type RecentPopUpLocationRequest = {
  id: string;
  location: string;
  createdAt: string | null;
  requestedDate: string | null;
  requestedStartTime: string | null;
  requestedEndTime: string | null;
};

type SupabaseLikeError = {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
};

function describeSupabaseError(error: SupabaseLikeError | null): string {
  if (!error) return "Unknown error";
  return [error.message, error.details, error.hint].filter(Boolean).join(" | ") || "Unknown error";
}

function buildLocationRanking(locations: string[]): RequestedLocationRank[] {
  const counts = new Map<string, number>();
  for (const raw of locations) {
    const location = (raw || "").trim();
    if (!location) continue;
    counts.set(location, (counts.get(location) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
}

export async function getRequestedLocationRanking(
  vendorId: string
): Promise<RequestedLocationRank[]> {
  const supabase = await createSupabaseServerClient();
  let rows: Array<{ location?: string; requested_location?: string }> = [];

  const primary = await supabase
    .from("popup_location_requests")
    .select("location")
    .eq("vendor_id", vendorId);
  let error = primary.error;
  rows = (primary.data as Array<{ location?: string }>) ?? [];

  if (error?.message?.includes("popup_location_requests.location does not exist")) {
    const fallback = await supabase
      .from("popup_location_requests")
      .select("requested_location")
      .eq("vendor_id", vendorId);
    rows = (fallback.data as Array<{ requested_location?: string }>) ?? [];
    error = fallback.error;
  }

  if (error) {
    // This feature is optional in some environments before all DB migrations are applied.
    if (error.code === "42P01") {
      return [];
    }

    console.error("Error fetching location ranking:", describeSupabaseError(error));
    return [];
  }

  const locations = rows
    .map((row) => (row.location as string) ?? (row.requested_location as string))
    .filter(Boolean);

  return buildLocationRanking(locations);
}

export async function getTopRequestedLocations(
  vendorId: string,
  limit = 4
): Promise<RequestedLocationRank[]> {
  const ranking = await getRequestedLocationRanking(vendorId);
  return ranking.slice(0, limit);
}

export async function getRecentPopUpLocationRequests(
  vendorId: string,
  limit = 5
): Promise<RecentPopUpLocationRequest[]> {
  const supabase = await createSupabaseServerClient();
  const primary = await supabase
    .from("popup_location_requests")
    .select("id, location, created_at, requested_date, requested_start_time, requested_end_time")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  let rows =
    (primary.data as Array<{
      id: string;
      location?: string | null;
      created_at?: string | null;
      requested_date?: string | null;
      requested_start_time?: string | null;
      requested_end_time?: string | null;
    }>) ??
    [];
  let error = primary.error;

  if (error?.message?.includes("popup_location_requests.location does not exist")) {
    const fallback = await supabase
      .from("popup_location_requests")
      .select("id, requested_location, requested_date")
      .eq("vendor_id", vendorId)
      .order("requested_date", { ascending: false })
      .limit(limit);

    rows =
      (fallback.data as Array<{
        id: string;
        requested_location?: string | null;
        requested_date?: string | null;
      }>)?.map((item) => ({
        id: item.id,
        location: item.requested_location,
        requested_date: item.requested_date,
      })) ?? [];
    error = fallback.error;
  }

  if (error) return [];

  return rows.map((row) => ({
    id: row.id,
    location: (row.location ?? "").trim() || "Unknown location",
    createdAt: row.created_at ?? null,
    requestedDate: row.requested_date ?? null,
    requestedStartTime: row.requested_start_time ?? null,
    requestedEndTime: row.requested_end_time ?? null,
  }));
}

type CreatePopUpScheduleInput = {
  vendorId: string;
  location: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landmark?: string | null;
};

function toIsoDateTime(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function createPopUpSchedule(input: CreatePopUpScheduleInput) {
  const supabase = await createSupabaseServerClient();
  const cleanLandmark = input.landmark?.trim();
  const cleanLocation = input.location.trim();
  const finalLocation = cleanLandmark
    ? `${cleanLocation} - ${cleanLandmark}`
    : cleanLocation;
  const scheduledDateIso = toIsoDateTime(input.scheduledDate, "00:00");
  const startTimeIso = input.startTime ? toIsoDateTime(input.scheduledDate, input.startTime) : null;
  const endTimeIso = input.endTime ? toIsoDateTime(input.scheduledDate, input.endTime) : null;

  if (!scheduledDateIso) {
    return { success: false, error: "Invalid date." };
  }

  const { data, error } = await supabase
    .from("popup_locations")
    .insert({
      vendor_id: input.vendorId,
      location: finalLocation,
      scheduled_date: scheduledDateIso,
      start_time: startTimeIso,
      end_time: endTimeIso,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .select("id, location, scheduled_date, start_time, end_time, latitude, longitude")
    .single();

  if (error) {
    console.error("Error creating pop-up schedule:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as PopUpSchedule };
}

export async function submitPopUpLocationRequest(
  vendorId: string,
  location: string,
  latitude?: number,
  longitude?: number,
  requestedDate?: string,
  startTime?: string,
  endTime?: string
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  // Ensure FK target exists for popup_location_requests.customer_id.
  const customerEnsure = await supabase
    .from("customers")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });
  if (customerEnsure.error) {
    return { success: false, error: customerEnsure.error.message };
  }

  const dateValue = requestedDate || new Date().toISOString().slice(0, 10);

  const firstTry = await supabase
    .from("popup_location_requests")
    .insert({
      customer_id: user.id,
      vendor_id: vendorId,
      location,
      requested_location: location,
      requested_date: dateValue,
      requested_start_time: startTime || null,
      requested_end_time: endTime || null,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  let data = firstTry.data;
  let error = firstTry.error;

  if (error) {
    const fallback = await supabase
      .from("popup_location_requests")
      .insert({
        customer_id: user.id,
        vendor_id: vendorId,
        requested_location: location,
        requested_date: dateValue,
        status: "pending",
      });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error submitting location request:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}