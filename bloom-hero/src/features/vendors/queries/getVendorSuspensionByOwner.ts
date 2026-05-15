"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { VendorSuspensionState } from "@/features/vendors/types";

export async function getVendorSuspensionByOwner(): Promise<VendorSuspensionState | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, shop_name, suspended_at, suspension_reason")
    .eq("owner_id", user.id)
    .maybeSingle<{
      id: string;
      shop_name: string | null;
      suspended_at: string | null;
      suspension_reason: string | null;
    }>();

  if (vendorError || !vendor) return null;

  const isSuspended = Boolean(vendor.suspended_at);
  if (!isSuspended) {
    return {
      isSuspended: false,
      vendorId: vendor.id,
      shopName: vendor.shop_name?.trim() || "Vendor Shop",
      suspensionReason: "",
      suspendedAt: null,
      pendingAppeal: null,
      lastResolvedAppeal: null,
    };
  }

  const { data: appeals, error: appealsError } = await supabase
    .from("vendor_suspension_appeals")
    .select("id, appeal_message, status, admin_response, reviewed_at, created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (appealsError) {
    const missingTable =
      appealsError.code === "42P01" ||
      appealsError.message.toLowerCase().includes("vendor_suspension_appeals");
    if (!missingTable) {
      console.error("Failed to load suspension appeals:", appealsError);
    }
  }

  const rows = appeals ?? [];
  const pending = rows.find((row) => row.status === "pending");
  const lastResolved = rows.find((row) => row.status === "approved" || row.status === "rejected");

  return {
    isSuspended: true,
    vendorId: vendor.id,
    shopName: vendor.shop_name?.trim() || "Vendor Shop",
    suspensionReason: vendor.suspension_reason?.trim() || "Your account was suspended by an administrator.",
    suspendedAt: vendor.suspended_at,
    pendingAppeal: pending
      ? {
          id: pending.id,
          message: pending.appeal_message,
          createdAt: pending.created_at,
        }
      : null,
    lastResolvedAppeal: lastResolved
      ? {
          status: lastResolved.status as "approved" | "rejected",
          adminResponse: lastResolved.admin_response,
          reviewedAt: lastResolved.reviewed_at,
        }
      : null,
  };
}
