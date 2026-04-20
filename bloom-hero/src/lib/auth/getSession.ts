import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const getSession = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  let vendor_type = null;
  let vendor_shop_name = null;

  if (profile?.role === "vendor") {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("vendor_type, shop_name")
      .eq("owner_id", user.id)
      .maybeSingle();

    vendor_type = vendor?.vendor_type ?? null;
    vendor_shop_name = vendor?.shop_name ?? null;
  }

  return {
    user,
    profile: {
      ...profile,
      vendor_type,
      vendor_shop_name,
    },
  };
});
