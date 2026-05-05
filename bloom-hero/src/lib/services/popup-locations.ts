import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type PopUpLocationRow = {
  id: string;
  location: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  vendors: {
    shop_name: string | null;
  } | null;
};

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
