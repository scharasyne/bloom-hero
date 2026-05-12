import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function upsertVendorByOwnerId(ownerId: string, shopName: string, vendorType: VendorType) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("vendors")
    .upsert({ owner_id: ownerId, shop_name: shopName, vendor_type: vendorType }, { onConflict: "owner_id" });
  if (error) throw new Error(error.message);
}