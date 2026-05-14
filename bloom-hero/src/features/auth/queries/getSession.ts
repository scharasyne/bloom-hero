// Origin: src/lib/auth/getSession.ts

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getVendorProfileByOwnerId } from "@/features/vendors/queries/getVendorProfileByOwnerId";
import type { BusinessType } from "@/features/vendors/types";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";

export const getSession = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: row } = await supabase
    .from("users")
    .select("role, name, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = row?.role as string | undefined;

  let business_type: BusinessType | null = null;
  let vendor_shop_name: string | null = null;

  if (role === "vendor") {
    const vendor = await getVendorProfileByOwnerId(user.id);
    business_type = normalizeBusinessType(vendor?.business_type) ?? "unregistered";
    vendor_shop_name = vendor?.shop_name ?? null;
  }

  return {
    user,
    profile: {
      role: row?.role as string | undefined,
      name: row?.name ?? null,
      email: row?.email ?? null,
      business_type,
      vendor_shop_name,
    },
  };
});
