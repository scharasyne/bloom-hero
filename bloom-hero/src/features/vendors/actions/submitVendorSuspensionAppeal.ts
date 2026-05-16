"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ActionResult } from "@/features/vendors/types";

export async function submitVendorSuspensionAppeal(
  appealMessage: string
): Promise<ActionResult> {
  const message = appealMessage.trim();
  if (message.length < 10) {
    return { ok: false, error: "Please write at least 10 characters for your appeal." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, suspended_at")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string; suspended_at: string | null }>();

  if (vendorError || !vendor) {
    return { ok: false, error: vendorError?.message ?? "Vendor profile not found." };
  }

  if (!vendor.suspended_at) {
    return { ok: false, error: "Your account is not suspended." };
  }

  const { data: existingPending, error: pendingError } = await supabase
    .from("vendor_suspension_appeals")
    .select("id")
    .eq("vendor_id", vendor.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) {
    return { ok: false, error: pendingError.message };
  }

  if (existingPending?.id) {
    return { ok: false, error: "You already have a pending appeal under review." };
  }

  const { error: insertError } = await supabase.from("vendor_suspension_appeals").insert({
    vendor_id: vendor.id,
    owner_id: user.id,
    appeal_message: message,
    status: "pending",
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  revalidatePath("/vendor", "layout");
  revalidatePath("/admin/vendors");

  return { ok: true };
}
