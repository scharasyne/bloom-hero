// Source: `src/app/(customer)/vendor-application/actions.ts` (getVendorApplicationDraftForCurrentUser only)

"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getVendorApplicationDraftByOwnerId } from "@/features/vendors/queries/getVendorApplicationDraft";

export async function getVendorApplicationDraftForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false as const };

  try {
    const draft = await getVendorApplicationDraftByOwnerId(session.user.id);
    return { ok: true as const, draft };
  } catch {
    return { ok: false as const };
  }
}
