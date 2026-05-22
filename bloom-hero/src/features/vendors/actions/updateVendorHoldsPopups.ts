"use server";

import { revalidatePath } from "next/cache";

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateVendorHoldsPopups(holdsPopups: boolean): Promise<ActionResult> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, business_type")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string; business_type: string | null }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor profile not found." };
  }

  const businessType = normalizeBusinessType(vendor.business_type);
  if (businessType !== "registered") {
    return { ok: false, error: "Only shop vendors can change this setting." };
  }

  const { error } = await supabase
    .from("vendors")
    .update({ holds_popups: holdsPopups })
    .eq("id", vendor.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/vendor/settings");
  revalidatePath("/search");
  revalidatePath("/map");

  return { ok: true };
}
