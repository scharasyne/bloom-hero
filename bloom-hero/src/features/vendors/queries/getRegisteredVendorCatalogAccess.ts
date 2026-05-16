"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { BusinessType } from "../types";
import { canManageCatalog } from "../utils/catalogAccess";
import { normalizeBusinessType } from "../utils/normalizeBusinessType";

export type RegisteredVendorCatalogAccess =
  | { ok: true; vendorId: string; businessType: "registered" }
  | {
      ok: false;
      businessType: BusinessType;
      reason: "unauthenticated" | "no_vendor" | "unregistered";
    };

export async function getRegisteredVendorCatalogAccess(): Promise<RegisteredVendorCatalogAccess> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, businessType: "unregistered", reason: "unauthenticated" };
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_type")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string; business_type: string | null }>();

  if (!vendor) {
    return { ok: false, businessType: "unregistered", reason: "no_vendor" };
  }

  const businessType = normalizeBusinessType(vendor.business_type) ?? "unregistered";
  if (!canManageCatalog(businessType)) {
    return { ok: false, businessType, reason: "unregistered" };
  }

  return { ok: true, vendorId: vendor.id, businessType: "registered" };
}
