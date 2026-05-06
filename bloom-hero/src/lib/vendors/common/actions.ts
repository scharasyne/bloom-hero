"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type VendorType = "market" | "pop-up";

export type VendorCommonProfile = {
  vendorId: string;
  vendorType: VendorType;
  shopName: string;
  location: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  scheduleLabel: string;
  scheduleStart: string;
  scheduleEnd: string;
  about: string;
};

type ActionResult = { ok: boolean; error?: string };
export type VendorStatus = "pending" | "approved" | "rejected";

const PHONE_PATTERN = /^\+63\d{9}$/;

export async function getVendorCommonProfileByOwner(
  vendorType: VendorType
): Promise<VendorCommonProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name, vendor_type, location_text, phone_number, opens_at, closes_at, about")
    .eq("owner_id", user.id)
    .eq("vendor_type", vendorType)
    .maybeSingle<{
      id: string;
      shop_name: string | null;
      vendor_type: VendorType;
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
      : vendorType === "pop-up"
        ? "See schedule tab"
        : "Set schedule in profile";

  return {
    vendorId: vendor.id,
    vendorType: vendor.vendor_type,
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

export async function updateVendorCommonProfileByOwner(input: {
  vendorType: VendorType;
  vendorId: string;
  shopName: string;
  location: string;
  phoneNumber: string;
  scheduleStart?: string;
  scheduleEnd?: string;
  about?: string;
  profilePhotoUrl?: string | null;
}): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You must be logged in." };

  const shopName = input.shopName.trim();
  const location = input.location.trim();
  const phoneNumber = input.phoneNumber.trim();
  const scheduleStart = input.scheduleStart?.trim() || null;
  const scheduleEnd = input.scheduleEnd?.trim() || null;
  const about = input.about?.trim() || null;
  const profilePhotoUrl = input.profilePhotoUrl?.trim() || null;

  if (!shopName) return { ok: false, error: "Shop name is required." };
  if (phoneNumber && !PHONE_PATTERN.test(phoneNumber)) {
    return { ok: false, error: "Phone number must match +63 followed by 9 digits." };
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("id", input.vendorId)
    .eq("owner_id", user.id)
    .eq("vendor_type", input.vendorType)
    .maybeSingle<{ id: string }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor profile not found." };
  }

  const { error: vendorUpdateError } = await supabase
    .from("vendors")
    .update({
      shop_name: shopName,
      location_text: location || null,
      phone_number: phoneNumber || null,
      opens_at: scheduleStart,
      closes_at: scheduleEnd,
      about,
    })
    .eq("id", input.vendorId)
    .eq("owner_id", user.id);

  if (vendorUpdateError) return { ok: false, error: vendorUpdateError.message };

  if (phoneNumber) {
    await supabase
      .from("users")
      .update({
        contact_number: phoneNumber,
      })
      .eq("id", user.id);
  }

  if (profilePhotoUrl !== null) {
    await supabase
      .from("users")
      .update({
        profile_photo_url: profilePhotoUrl,
      })
      .eq("id", user.id);
  }

  revalidatePath("/market/profile");
  revalidatePath("/pop-up/profile");
  return { ok: true };
}

export async function getVendorStatusByOwner(
  vendorType: VendorType
): Promise<VendorStatus | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("vendors")
    .select("status")
    .eq("owner_id", user.id)
    .eq("vendor_type", vendorType)
    .maybeSingle<{ status: VendorStatus }>();

  if (error) return null;
  return data?.status ?? null;
}
