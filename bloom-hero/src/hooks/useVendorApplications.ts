import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  approveVendorApplication,
  type IssuedVendorCredentials,
  rejectVendorApplication,
} from "@/app/admin/vendor-applications/actions";
import { VendorApplicationRecord } from "@/typess";

const supabase = createSupabaseBrowserClient();

export function useVendorApplications() {
  const [data, setData] = useState<VendorApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: applications, error: fetchError } = await supabase
        .from("vendor_applications")
        .select(
          "id, owner_id, shop_name, shop_address, email, phone_number, vendor_type, business_submission_timing, primary_business_document_type, primary_business_document_url, government_id_type, government_id_document_url, taxpayer_identification_number, vat_registration_status, bir_certificate_url, submission_status, submitted_at, created_at, updated_at"
        )
        .eq("submission_status", "submitted")
        .order("submitted_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) {
        setData([]);
        setError(fetchError.message);
        return;
      }

      setData((applications ?? []) as VendorApplicationRecord[]);
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
