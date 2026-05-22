import { createPublicCatalogSupabaseClient } from "@/lib/supabase/public-catalog-client";

/** Public catalog search: prefer service role so RLS cannot block guest/customer reads. */
export async function createSearchSupabaseClient() {
  return createPublicCatalogSupabaseClient();
}
