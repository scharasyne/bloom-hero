import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { RecentPopUpLocationRequest } from "../types"

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