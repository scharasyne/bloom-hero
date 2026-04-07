import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
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

  const approve = async (application: VendorApplicationRecord) => {
    const vendorName = application.shop_name?.trim() || "Vendor Shop";
    const vendorType = application.vendor_type ?? "market";

    const { error: roleError } = await supabase
      .from("users")
      .update({ role: "vendor" })
      .eq("id", application.owner_id);

    if (roleError) {
      throw new Error(roleError.message);
    }

    const { error: vendorError } = await supabase.from("vendors").upsert(
      {
        owner_id: application.owner_id,
        shop_name: vendorName,
        vendor_type: vendorType,
        status: "approved",
        rejection_reason: null,
        approved_at: new Date().toISOString(),
        rejected_at: null,
      },
      { onConflict: "owner_id" }
    );

    if (vendorError) {
      throw new Error(vendorError.message);
    }

    const { error: deleteError } = await supabase
      .from("vendor_applications")
      .delete()
      .eq("id", application.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    setData((prev) => prev.filter((item) => item.id !== application.id));
  };

  const reject = async (application: VendorApplicationRecord, reason: string) => {
    const vendorType = application.vendor_type ?? "market";

    const { error: vendorError } = await supabase.from("vendors").upsert(
      {
        owner_id: application.owner_id,
        shop_name: application.shop_name?.trim() || "Vendor Shop",
        vendor_type: vendorType,
        status: "rejected",
        rejection_reason: reason,
        approved_at: null,
        rejected_at: new Date().toISOString(),
      },
      { onConflict: "owner_id" }
    );

    if (vendorError) {
      throw new Error(vendorError.message);
    }

    const { error: deleteError } = await supabase
      .from("vendor_applications")
      .delete()
      .eq("id", application.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    setData((prev) => prev.filter((item) => item.id !== application.id));
  };

  return { data, isLoading, error, refresh: loadApplications, approve, reject };
}
