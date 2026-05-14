"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { VendorStatus } from "../types";

export async function getVendorStatusByOwner(): Promise<VendorStatus | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("vendors")
    .select("status")
    .eq("owner_id", user.id)
    .maybeSingle<{ status: VendorStatus }>();

  if (error) return null;
  return data?.status ?? null;
}
