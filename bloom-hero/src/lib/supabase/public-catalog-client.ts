import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Server reads for public catalog, auth profile, map, and vendor pages.
 * Prefers service role when SUPABASE_SERVICE_ROLE_KEY is set (RLS cannot block);
 * falls back to the cookie session client.
 */
export async function createPublicCatalogSupabaseClient() {
  try {
    return createSupabaseAdminClient();
  } catch {
    return createSupabaseServerClient();
  }
}
