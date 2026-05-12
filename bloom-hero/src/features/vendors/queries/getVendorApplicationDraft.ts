import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { VendorApplicationDraftRow } from "../types";

export async function getVendorApplicationDraftByOwnerId(ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendor_applications")
    .select(
      "shop_name, shop_address, email, phone_number, vendor_type, government_id_type, taxpayer_identification_number, vat_registration_status, primary_business_document_url, government_id_document_url, bir_certificate_url, submission_status"
    )
    .eq("owner_id", ownerId)
    .maybeSingle<VendorApplicationDraftRow>();

  if (error) throw new Error(error.message);
  return data;
}