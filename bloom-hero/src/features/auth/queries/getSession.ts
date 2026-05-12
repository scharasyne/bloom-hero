// Origin: src/lib/auth/getSession.ts

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getVendorProfileByOwnerId } from "@/features/vendors/queries/getVendorProfileByOwnerId";

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

  let vendor_type: "market" | "pop-up" | null = null;
  let vendor_shop_name: string | null = null;

  if (role === "vendor") {
    const vendor = await getVendorProfileByOwnerId(user.id);
    vendor_type = (vendor?.vendor_type as "market" | "pop-up" | null) ?? null;
    vendor_shop_name = vendor?.shop_name ?? null;
  }

  return {
    user,
    profile: {
      role: row?.role as string | undefined,
      name: row?.name ?? null,
      email: row?.email ?? null,
      vendor_type,
      vendor_shop_name,
    },
  };
});