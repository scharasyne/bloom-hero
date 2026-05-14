import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { VendorProfileByOwnerRow } from "../types";

export async function getVendorProfileByOwnerId(ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("business_type, shop_name")
    .eq("owner_id", ownerId)
    .maybeSingle<VendorProfileByOwnerRow>();
  if (error) throw new Error(error.message);
  return data;
}
