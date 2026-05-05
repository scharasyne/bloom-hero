import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type VendorType = "market" | "pop-up";
type VatRegistrationStatus = "vat-registered" | "non-vat-registered";

export type VendorApplicationDraftRow = {
  shop_name: string | null;
  shop_address: string | null;
  email: string | null;
  phone_number: string | null;
  vendor_type: VendorType | null;
  government_id_type: string | null;
  taxpayer_identification_number: string | null;
  vat_registration_status: VatRegistrationStatus | null;
  primary_business_document_url: string | null;
  government_id_document_url: string | null;
  bir_certificate_url: string | null;
  submission_status: string | null;
};

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

export async function listSubmittedVendorApplications() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendor_applications")
    .select(
      "id, owner_id, shop_name, shop_address, email, phone_number, vendor_type, business_submission_timing, primary_business_document_type, primary_business_document_url, government_id_type, government_id_document_url, taxpayer_identification_number, vat_registration_status, bir_certificate_url, submission_status, submitted_at, created_at, updated_at"
    )
    .eq("submission_status", "submitted")
    .order("submitted_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertVendorApplicationByOwnerId(ownerId: string, payload: Record<string, unknown>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("vendor_applications")
    .upsert({ owner_id: ownerId, ...payload }, { onConflict: "owner_id" });
  if (error) throw new Error(error.message);
}

export async function updateUserRoleAndContact(userId: string, contactNumber: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("users")
    .update({ role: "customer", contact_number: contactNumber })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function upsertVendorByOwnerId(ownerId: string, shopName: string, vendorType: VendorType) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("vendors")
    .upsert({ owner_id: ownerId, shop_name: shopName, vendor_type: vendorType }, { onConflict: "owner_id" });
  if (error) throw new Error(error.message);
}

export async function uploadVendorDocument(ownerId: string, file: File, documentType: string) {
  const supabase = await createSupabaseServerClient();
  const extension = file.name.split(".").pop() ?? "dat";
  const filePath = `${ownerId}/vendor-application/${documentType}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("vendor-documents").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("vendor-documents").getPublicUrl(filePath);
  return data.publicUrl;
}
