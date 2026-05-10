import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { PopUpLocationRow } from "../types";

export async function getPopupLocationsWithVendor() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("popup_locations")
    .select("id, location, scheduled_date, start_time, end_time, latitude, longitude, vendors!inner(shop_name)")
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PopUpLocationRow[];
}
