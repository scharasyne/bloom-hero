import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getVendorTypeByOwnerId(ownerId: string) {
  const vendor = await getVendorProfileByOwnerId(ownerId);
  return vendor?.vendor_type as VendorLegacyType | null | undefined;
}