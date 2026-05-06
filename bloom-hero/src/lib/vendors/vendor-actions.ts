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

interface Vendor {
  id: string;
  shop_name: string;
  description?: string;
}

export async function getVendorProfile(vendorId: string): Promise<Vendor | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("id, shop_name")
    .eq("id", vendorId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching vendor:", error);
    return null;
  }

  return data || null;
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

export type RequestedLocationRank = {
  location: string;
  count: number;
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
  longitude?: number
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("popup_location_requests")
    .insert({
      vendor_id: vendorId,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error submitting location request:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}