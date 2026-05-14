"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { VendorCommonProfile, BusinessType } from "../types";
import { normalizeBusinessType } from "../utils/normalizeBusinessType";

export async function getVendorCommonProfileByOwner(): Promise<VendorCommonProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name, business_type, location_text, phone_number, opens_at, closes_at, about")
    .eq("owner_id", user.id)
    .maybeSingle<{
      id: string;
      shop_name: string | null;
      business_type: BusinessType;
      location_text: string | null;
      phone_number: string | null;
      opens_at: string | null;
      closes_at: string | null;
      about: string | null;
    }>();

  if (vendorError || !vendor) {
    throw new Error(vendorError?.message ?? "Vendor profile not found.");
  }

  let profilePhotoUrl: string | null = null;
  const userProfilePrimary = await supabase
    .from("users")
    .select("profile_photo_url")
    .eq("id", user.id)
    .maybeSingle<{ profile_photo_url: string | null }>();
  if (!userProfilePrimary.error && userProfilePrimary.data?.profile_photo_url) {
    profilePhotoUrl = userProfilePrimary.data.profile_photo_url;
  }

  const scheduleStart = vendor.opens_at ?? "";
  const scheduleEnd = vendor.closes_at ?? "";
  const scheduleLabel =
    scheduleStart && scheduleEnd
      ? `${scheduleStart.slice(0, 5)} - ${scheduleEnd.slice(0, 5)}`
      : "See schedule tab";

  return {
    vendorId: vendor.id,
    businessType: normalizeBusinessType(vendor.business_type) ?? "unregistered",
    shopName: vendor.shop_name?.trim() || "Vendor Shop",
    location: vendor.location_text?.trim() || "",
    phoneNumber: vendor.phone_number?.trim() || "",
    profilePhotoUrl,
    scheduleLabel,
    scheduleStart,
    scheduleEnd,
    about: vendor.about?.trim() || "",
  };
}
