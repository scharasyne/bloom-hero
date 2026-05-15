import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { BusinessType } from "@/features/vendors/types";

export type VendorStatus = "active" | "suspended";

export type VendorAppealSummary = {
  id: string;
  status: "pending" | "approved" | "rejected";
  appealMessage: string;
  adminResponse: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type VendorRecord = {
  id: string;
  storeName: string;
  ownerName: string;
  businessType: BusinessType;
  status: VendorStatus;
  location: string;
  joinedAt: string;
  createdAtIso: string;
  suspendedAt: string | null;
  suspensionReason: string | null;
  phoneNumber: string | null;
  about: string | null;
  totalOrders: number;
  email: string;
  appeals: VendorAppealSummary[];
  pendingAppeal: VendorAppealSummary | null;
};

type AppealRow = {
  id: string;
  appeal_message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type VendorRow = {
  id: string;
  shop_name: string | null;
  business_type: BusinessType;
  status: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  location_text: string | null;
  phone_number: string | null;
  about: string | null;
  owner: {
    name: string | null;
    email: string | null;
  } | null;
  appeals: AppealRow[] | null;
};

const supabase = createSupabaseBrowserClient();

export const NEWLY_ADDED_VENDOR_DAYS = 30;

function normalizeStatus(suspendedAt: string | null): VendorStatus {
  return suspendedAt ? "suspended" : "active";
}

function mapAppeal(row: AppealRow): VendorAppealSummary {
  return {
    id: row.id,
    status: row.status as VendorAppealSummary["status"],
    appealMessage: row.appeal_message,
    adminResponse: row.admin_response,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  };
}

function mapVendor(row: VendorRow): VendorRecord {
  const appeals = (row.appeals ?? [])
    .map(mapAppeal)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pendingAppeal = appeals.find((appeal) => appeal.status === "pending") ?? null;

  return {
    id: row.id,
    storeName: row.shop_name?.trim() || "Vendor Shop",
    ownerName: row.owner?.name?.trim() || "Vendor Owner",
    businessType: row.business_type,
    status: normalizeStatus(row.suspended_at),
    location: row.location_text?.trim() || "Location unavailable",
    joinedAt: new Date(row.created_at).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAtIso: row.created_at,
    suspendedAt: row.suspended_at,
    suspensionReason: row.suspension_reason?.trim() || null,
    phoneNumber: row.phone_number?.trim() || null,
    about: row.about?.trim() || null,
    totalOrders: 0,
    email: row.owner?.email?.trim() || "No email",
    appeals,
    pendingAppeal,
  };
}

export function useVendors() {
  const [data, setData] = useState<VendorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: rows, error: fetchError } = await supabase
        .from("vendors")
        .select(
          "id, shop_name, business_type, status, suspended_at, suspension_reason, created_at, location_text, phone_number, about, owner:users!vendors_owner_id_fkey(name, email), appeals:vendor_suspension_appeals(id, appeal_message, status, admin_response, created_at, reviewed_at)"
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        setData([]);
        setError(fetchError.message);
        return;
      }

      setData(((rows ?? []) as unknown as VendorRow[]).map(mapVendor));
    } catch (loadError) {
      setData([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load vendors.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadVendors();
  }, []);

  return { data, isLoading, error, reload: loadVendors };
}

export function isNewlyAddedVendor(createdAtIso: string, days = NEWLY_ADDED_VENDOR_DAYS) {
  const created = new Date(createdAtIso).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return created >= cutoff;
}
