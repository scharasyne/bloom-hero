import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { RequestedLocationRank } from "../types";
import { buildLocationRanking } from "../utils/buildLocationRanking";
import { describeSupabaseError } from "../utils/supabaseError";

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