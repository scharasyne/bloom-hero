import { cache } from "react";

import type { BusinessType } from "@/features/vendors/types";
import { getVendorProfileByOwnerId } from "@/features/vendors/queries/getVendorProfileByOwnerId";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";

export type CachedUserProfile = {
  role: string | undefined;
  name: string | null;
  email: string | null;
  business_type: BusinessType | null;
  vendor_shop_name: string | null;
};

async function loadUserProfile(userId: string): Promise<CachedUserProfile> {
  const supabase = await createPublicCatalogSupabaseClient();

  const { data: row } = await supabase
    .from("users")
    .select("role, name, email")
    .eq("id", userId)
    .maybeSingle();

  const role = row?.role as string | undefined;

  let business_type: BusinessType | null = null;
  let vendor_shop_name: string | null = null;

  if (role === "vendor") {
    const vendor = await getVendorProfileByOwnerId(userId);
    business_type = normalizeBusinessType(vendor?.business_type) ?? "unregistered";
    vendor_shop_name = vendor?.shop_name ?? null;
  }

  return {
    role,
    name: row?.name ?? null,
    email: row?.email ?? null,
    business_type,
    vendor_shop_name,
  };
}

/** Per-request dedupe (uses cookies via Supabase client; not unstable_cache). */
export const getCachedUserProfile = cache(async (userId: string) => loadUserProfile(userId));
