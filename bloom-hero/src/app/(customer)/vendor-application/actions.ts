"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type VendorType = "market" | "pop-up";
type VatRegistrationStatus = "vat-registered" | "non-vat-registered";

type DraftInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
  vendorType: VendorType;
  governmentIdType: string;
  tin: string;
  vatRegistrationStatus: VatRegistrationStatus | "";
};

type SubmitInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
  vendorType: VendorType;
  governmentIdType: string;
  tin: string;
  vatRegistrationStatus: VatRegistrationStatus | "";
  primaryBusinessDocumentUrl: string | null;
  governmentIdDocumentUrl: string | null;
  birCertificateUrl: string | null;
};

type ActionResult = {
  ok: boolean;
  error?: string;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validateStepOne(input: DraftInput, accountEmail?: string | null): string | null {
  if (!input.shopName.trim()) return "Shop Name is required.";
  if (!input.shopAddress.trim()) return "Shop Address is required.";
  if (!input.email.trim()) return "Business email is required.";
  const businessEmail = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) return "Please enter a valid business email.";
  if (accountEmail && businessEmail === normalizeEmail(accountEmail)) {
    return "Business email must be different from your account email.";
  }
  if (!/^\d{10}$/.test(input.phoneNumber.trim())) return "Phone Number must be exactly 10 digits.";
  return null;
}

function validateStepTwo(input: SubmitInput): string | null {
  if (!input.governmentIdType) return "Please select a Government ID Type.";
  if (!input.governmentIdDocumentUrl) return "Please upload your Government ID document.";

  if (input.vendorType === "pop-up") return null;

  if (!input.tin.trim()) return "Taxpayer Identification Number (TIN) is required.";
  if (!/^[0-9-]{9,15}$/.test(input.tin.trim())) {
    return "TIN must be 9 to 15 characters and can only include numbers and dashes.";
  }
  if (!input.vatRegistrationStatus) return "Please select your VAT registration status.";
  if (!input.primaryBusinessDocumentUrl) return "Please upload your Primary Business Document.";
  if (!input.birCertificateUrl) return "Please upload your BIR Certificate of Registration.";

  return null;
}

export async function saveVendorApplicationDraft(input: DraftInput): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false, error: "You need to log in again." };

  const stepOneError = validateStepOne(input, session.user.email);
  if (stepOneError) return { ok: false, error: stepOneError };

  const { error } = await supabase.from("vendor_applications").upsert(
    {
      owner_id: session.user.id,
      shop_name: input.shopName.trim() || null,
      shop_address: input.shopAddress.trim() || null,
      email: input.email.trim() || null,
      phone_number: `+63${input.phoneNumber.trim()}`,
      vendor_type: input.vendorType,
      business_submission_timing: null,
      primary_business_document_type: input.vendorType === "pop-up" ? null : "DTI Certificate",
      government_id_type: input.governmentIdType || null,
      taxpayer_identification_number: input.vendorType === "pop-up" ? null : input.tin.trim() || null,
      vat_registration_status: input.vendorType === "pop-up" ? null : input.vatRegistrationStatus || null,
      submission_status: "draft",
    },
    { onConflict: "owner_id" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/customer/vendor-application");
  return { ok: true };
}

export async function submitVendorApplication(input: SubmitInput): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false, error: "You need to log in again." };

  const stepOneError = validateStepOne(input, session.user.email);
  if (stepOneError) return { ok: false, error: stepOneError };

  const stepTwoError = validateStepTwo(input);
  if (stepTwoError) return { ok: false, error: stepTwoError };

  const { error: applicationError } = await supabase.from("vendor_applications").upsert(
    {
      owner_id: session.user.id,
      shop_name: input.shopName.trim(),
      shop_address: input.shopAddress.trim(),
      email: input.email.trim(),
      phone_number: `+63${input.phoneNumber.trim()}`,
      vendor_type: input.vendorType,
      business_submission_timing: null,
      primary_business_document_type: input.vendorType === "pop-up" ? null : "DTI Certificate",
      primary_business_document_url: input.vendorType === "pop-up" ? null : input.primaryBusinessDocumentUrl,
      government_id_type: input.governmentIdType,
      government_id_document_url: input.governmentIdDocumentUrl,
      taxpayer_identification_number: input.vendorType === "pop-up" ? null : input.tin.trim(),
      vat_registration_status: input.vendorType === "pop-up" ? null : input.vatRegistrationStatus,
      bir_certificate_url: input.vendorType === "pop-up" ? null : input.birCertificateUrl,
      submission_status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" }
  );

  if (applicationError) return { ok: false, error: applicationError.message };

  const { error: roleError } = await supabase
    .from("users")
    .update({ role: "customer", contact_number: `+63${input.phoneNumber.trim()}` })
    .eq("id", session.user.id);

  if (roleError) return { ok: false, error: roleError.message };

  const { error: vendorError } = await supabase
    .from("vendors")
    .upsert({ owner_id: session.user.id, shop_name: input.shopName.trim(), vendor_type: input.vendorType }, { onConflict: "owner_id" });

  if (vendorError) return { ok: false, error: vendorError.message };

  revalidatePath("/customer/vendor-application");

  return { ok: true };
}
