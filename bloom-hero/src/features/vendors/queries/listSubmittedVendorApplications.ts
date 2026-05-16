import { createSupabaseServerClient } from "@/lib/supabase/server-client"

export async function listSubmittedVendorApplications() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendor_applications")
    .select(
      "id, owner_id, shop_name, shop_address, email, phone_number, business_type, business_submission_timing, primary_business_document_type, primary_business_document_url, government_id_type, government_id_document_url, taxpayer_identification_number, vat_registration_status, bir_certificate_url, submission_status, submitted_at, created_at, updated_at"
    )
    .eq("submission_status", "submitted")
    .order("submitted_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}