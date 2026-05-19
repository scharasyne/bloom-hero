import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";
import { Vendor } from "../interface";

type GetVendorProfileOptions = {
  /** Owner preview or admin; otherwise only approved vendors are returned. */
  includeUnapproved?: boolean;
};

export async function getVendorProfile(
  vendorId: string,
  options?: GetVendorProfileOptions
): Promise<Vendor | null> {
  const supabase = await createPublicCatalogSupabaseClient();

  let query = supabase
    .from("vendors")
    .select(
      "id, shop_name, business_type, holds_popups, about, location_text, phone_number, opens_at, closes_at, status"
    )
    .eq("id", vendorId);

  if (!options?.includeUnapproved) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error(
      "Error fetching vendor:",
      error.message,
      error.code,
      error.details,
      error.hint
    );
    return null;
  }

  if (!data) return null;

  const { status: _status, ...vendor } = data;
  return vendor;
}
