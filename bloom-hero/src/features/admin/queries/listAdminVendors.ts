"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { AdminActionResult, AdminVendorRecord } from "@/features/admin/types";
import { ensureAdmin } from "@/features/admin/utils/ensureAdmin";
import { mapAdminVendor } from "@/features/admin/utils/mapAdminVendor";

export async function listAdminVendors(): Promise<AdminActionResult<AdminVendorRecord[]>> {
  const adminCheck = await ensureAdmin();
  if (adminCheck.error) {
    return { ok: false, error: adminCheck.error };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("vendors")
      .select(
        "id, owner_id, shop_name, business_type, status, suspended_at, suspension_reason, created_at, location_text, phone_number, about, owner:users!vendors_owner_id_fkey(name, email), appeals:vendor_suspension_appeals(id, appeal_message, status, admin_response, created_at, reviewed_at)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, error: error.message };
    }

    return {
      ok: true,
      data: (rows ?? []).map((row) => mapAdminVendor(row as never)),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to load vendors.",
    };
  }
}
