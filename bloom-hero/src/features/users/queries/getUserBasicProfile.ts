import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";

export async function getUserBasicProfileById(userId: string) {
  const supabase = await createPublicCatalogSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("name, email, contact_number")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}