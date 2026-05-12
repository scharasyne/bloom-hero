// Origin: src/lib/services/vendors.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { VendorProfileByOwnerRow, VendorLegacyType } from "../types";

export async function getVendorProfileByOwnerId(ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("vendor_type, shop_name")
    .eq("owner_id", ownerId)
    .maybeSingle<VendorProfileByOwnerRow>();
  if (error) throw new Error(error.message);
  return data;
}

export async function getVendorTypeByOwnerId(ownerId: string) {
  const vendor = await getVendorProfileByOwnerId(ownerId);
  return vendor?.vendor_type as VendorLegacyType | null | undefined;
}