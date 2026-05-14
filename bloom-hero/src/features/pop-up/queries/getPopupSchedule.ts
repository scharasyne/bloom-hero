import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { PopUpSchedule } from "../types";

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