"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { BusinessType, ActionResult, PHONE_PATTERN } from '../types';

export async function updateVendorCommonProfileByOwner(input: {
  businessType: BusinessType;
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

  revalidatePath("/vendor/profile");
//   revalidatePath("/pop-up/profile");
  return { ok: true };
}