import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type VendorStatus = "active" | "suspended";
export type VendorType = "market" | "pop-up";

export type VendorRecord = {
  id: string;
  storeName: string;
  ownerName: string;
  vendorType: VendorType;
  status: VendorStatus;
  location: string;
  joinedAt: string;
  totalOrders: number;
  email: string;
};

type VendorRow = {
  id: string;
  shop_name: string | null;
  vendor_type: VendorType;
  status: string | null;
  suspended_at: string | null;
  created_at: string;
  owner: {
    name: string | null;
    email: string | null;
  } | null;
};

const supabase = createSupabaseBrowserClient();

function normalizeStatus(suspendedAt: string | null): VendorStatus {
  return suspendedAt ? "suspended" : "active";
}

function mapVendor(row: VendorRow): VendorRecord {
  return {
    id: row.id,
    storeName: row.shop_name?.trim() || "Vendor Shop",
    ownerName: row.owner?.name?.trim() || "Vendor Owner",
    vendorType: row.vendor_type,
    status: normalizeStatus(row.suspended_at),
    location: "Location unavailable",
    joinedAt: new Date(row.created_at).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    totalOrders: 0,
    email: row.owner?.email?.trim() || "No email",
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
        .select("id, shop_name, vendor_type, status, suspended_at, created_at, owner:users!vendors_owner_id_fkey(name, email)")
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

  return { data, isLoading, error, refresh: loadVendors };
}