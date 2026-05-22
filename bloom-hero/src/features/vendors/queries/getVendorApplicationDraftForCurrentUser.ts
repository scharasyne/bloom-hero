// Source: `src/app/(customer)/vendor-application/actions.ts` (getVendorApplicationDraftForCurrentUser only)

"use server";

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getVendorApplicationDraftByOwnerId } from "@/features/vendors/queries/getVendorApplicationDraft";

export async function getVendorApplicationDraftForCurrentUser() {
  const user = await getAuthUser();
  if (!user) return { ok: false as const };

  try {
    const draft = await getVendorApplicationDraftByOwnerId(user.id);
    return { ok: true as const, draft };
  } catch {
    return { ok: false as const };
  }
}
