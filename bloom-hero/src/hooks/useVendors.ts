import { useCallback, useEffect, useState } from "react";
import { listAdminVendors } from "@/features/admin/queries/listAdminVendors";
import type { AdminVendorRecord } from "@/features/admin/types";

export type {
  AdminVendorRecord as VendorRecord,
  AdminVendorStatus as VendorStatus,
} from "@/features/admin/types";
export { isNewlyAddedVendor, NEWLY_ADDED_VENDOR_DAYS } from "@/features/admin/utils/vendorInsights";

export function useVendors() {
  const [data, setData] = useState<AdminVendorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listAdminVendors();
      if (!result.ok) {
        setData([]);
        setError(result.error ?? "Failed to load vendors.");
        return;
      }
      setData(result.data ?? []);
    } catch (loadError) {
      setData([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load vendors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  return { data, isLoading, error, reload: loadVendors };
}
