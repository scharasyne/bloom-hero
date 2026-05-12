import { createSupabaseServerClient } from "@/lib/supabase/server-client";


export async function upsertVendorApplicationByOwnerId(ownerId: string, payload: Record<string, unknown>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("vendor_applications")
    .upsert({ owner_id: ownerId, ...payload }, { onConflict: "owner_id" });
  if (error) throw new Error(error.message);
}