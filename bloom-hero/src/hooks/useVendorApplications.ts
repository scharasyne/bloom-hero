import { useEffect, useState } from "react";
import {
  approveVendorApplication,
  getSubmittedVendorApplications,
  type IssuedVendorCredentials,
  rejectVendorApplication,
} from "@/app/admin/vendor-applications/actions";
import { VendorApplicationRecord } from "@/types";

export function useVendorApplications() {
  const [data, setData] = useState<VendorApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getSubmittedVendorApplications();
      if (!result.ok) {
        setData([]);
        setError(result.error ?? "Failed to load vendor applications.");
        return;
      }
      setData((result.data ?? []) as VendorApplicationRecord[]);
    } catch (loadError) {
      setData([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load vendor applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  type ApproveResult = {
    credentials: IssuedVendorCredentials;
  };

  const approve = async (application: VendorApplicationRecord) => {
    const result = await approveVendorApplication(application.id);

    if (!result.ok || !result.data) {
      throw new Error(result.error ?? "Failed to approve vendor application.");
    }

    setData((prev) => prev.filter((item) => item.id !== application.id));

    return { credentials: result.data } satisfies ApproveResult;
  };

  const reject = async (application: VendorApplicationRecord, reason: string) => {
    const result = await rejectVendorApplication(application.id, reason);

    if (!result.ok) {
      throw new Error(result.error ?? "Failed to reject vendor application.");
    }

    setData((prev) => prev.filter((item) => item.id !== application.id));
  };

  return { data, isLoading, error, refresh: loadApplications, approve, reject };
}
