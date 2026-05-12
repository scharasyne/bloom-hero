import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Vendor } from "../interface";

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