import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { BusinessType } from "../types";

export async function upsertVendorByOwnerId(
  ownerId: string,
  shopName: string,
  businessType: BusinessType
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("vendors").upsert(
    {
      owner_id: ownerId,
      shop_name: shopName,
      business_type: businessType,
      holds_popups: true,
    },
    { onConflict: "owner_id" },
  );
  if (error) throw new Error(error.message);
}
