import { cache } from "react";

import type { VendorCommonProfile, BusinessType } from "@/features/vendors/types";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";

async function loadVendorCommonProfile(ownerId: string): Promise<VendorCommonProfile | null> {
  const supabase = await createPublicCatalogSupabaseClient();

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select(
      "id, shop_name, business_type, holds_popups, location_text, phone_number, opens_at, closes_at, about",
    )
    .eq("owner_id", ownerId)
    .maybeSingle<{
      id: string;
      shop_name: string | null;
      business_type: BusinessType;
      holds_popups: boolean | null;
      location_text: string | null;
      phone_number: string | null;
      opens_at: string | null;
      closes_at: string | null;
      about: string | null;
    }>();

  if (vendorError || !vendor) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("profile_photo_url")
    .eq("id", ownerId)
    .maybeSingle<{ profile_photo_url: string | null }>();

  const scheduleStart = vendor.opens_at ?? "";
  const scheduleEnd = vendor.closes_at ?? "";
  const scheduleLabel =
    scheduleStart && scheduleEnd
      ? `${scheduleStart.slice(0, 5)} - ${scheduleEnd.slice(0, 5)}`
      : "See schedule tab";

  const businessType = normalizeBusinessType(vendor.business_type) ?? "unregistered";

  return {
    vendorId: vendor.id,
    businessType,
    holdsPopups: businessType === "unregistered" ? true : Boolean(vendor.holds_popups ?? true),
    shopName: vendor.shop_name?.trim() || "Vendor Shop",
    location: vendor.location_text?.trim() || "",
    phoneNumber: vendor.phone_number?.trim() || "",
    profilePhotoUrl: userRow?.profile_photo_url ?? null,
    scheduleLabel,
    scheduleStart,
    scheduleEnd,
    about: vendor.about?.trim() || "",
  };
}

/** Per-request dedupe (uses cookies via Supabase client; not unstable_cache). */
export const getCachedVendorCommonProfile = cache(async (ownerId: string) =>
  loadVendorCommonProfile(ownerId),
);
