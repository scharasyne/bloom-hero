import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type VendorIdResult =
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | { status: "ready"; vendorId: string };

export async function getVendorIdByOwner(): Promise<VendorIdResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "unauthenticated" };

  const { data: vendor, error } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !vendor) return { status: "not-found" };
  return { status: "ready", vendorId: vendor.id };
}

export async function getPopUpVendorIdByOwner() {
  return getVendorIdByOwner();
}
