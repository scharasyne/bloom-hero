import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";
import { PopUpLocationRow } from "../types";

export async function getPopupLocationsWithVendor() {
  const supabase = await createPublicCatalogSupabaseClient();
  const { data, error } = await supabase
    .from("popup_locations")
    .select(
      "id, vendor_id, location, scheduled_date, start_time, end_time, latitude, longitude, vendors!inner(id, shop_name, business_type)"
    )
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PopUpLocationRow[];
}
