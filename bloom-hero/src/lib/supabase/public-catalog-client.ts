import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Server reads for public catalog, map, and vendor pages.
 * Uses the cookie session client (anon or authenticated) so RLS applies.
 * Set SUPABASE_CATALOG_USE_SERVICE_ROLE=true only if a legacy deployment still
 * requires bypassing RLS for catalog reads.
 */
export async function createPublicCatalogSupabaseClient() {
  if (process.env.SUPABASE_CATALOG_USE_SERVICE_ROLE === "true") {
    try {
      return createSupabaseAdminClient();
    } catch {
      // Fall through to session client when service role is misconfigured.
    }
  }

  return createSupabaseServerClient();
}
