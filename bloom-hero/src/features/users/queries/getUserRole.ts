import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";

export async function getUserRoleById(userId: string) {
  const supabase = await createPublicCatalogSupabaseClient();
  const { data, error } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.role as string | undefined;
}