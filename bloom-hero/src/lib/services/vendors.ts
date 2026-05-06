import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getVendorTypeByOwnerId(ownerId: string) {
  const vendor = await getVendorProfileByOwnerId(ownerId);
  return vendor?.vendor_type as "market" | "pop-up" | null | undefined;
}

export async function getVendorProfileByOwnerId(ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("vendor_type, shop_name")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
