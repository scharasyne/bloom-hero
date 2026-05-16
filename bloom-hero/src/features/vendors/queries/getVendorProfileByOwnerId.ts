import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";
import type { VendorProfileByOwnerRow } from "../types";

export async function getVendorProfileByOwnerId(ownerId: string) {
  const supabase = await createPublicCatalogSupabaseClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, business_type, shop_name")
    .eq("owner_id", ownerId)
    .maybeSingle<VendorProfileByOwnerRow>();
  if (error) throw new Error(error.message);
  return data;
}
