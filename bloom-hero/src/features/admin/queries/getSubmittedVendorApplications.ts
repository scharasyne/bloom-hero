"use server";

import { listSubmittedVendorApplications } from "@/features/vendors/queries/listSubmittedVendorApplications";
import type { AdminActionResult } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import type { VendorApplicationRecord } from "@/types";

export async function getSubmittedVendorApplications(): Promise<
  AdminActionResult<VendorApplicationRecord[]>
> {
  const adminCheck = await ensureAdmin();
  if (adminCheck.error) {
    return { ok: false, error: adminCheck.error };
  }

  try {
    const data = await listSubmittedVendorApplications();
    return { ok: true, data: data as VendorApplicationRecord[] };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load vendor applications.",
    };
  }
}
