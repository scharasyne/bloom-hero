"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  getVendorApplicationDraftByOwnerId,
  upsertVendorApplicationByOwnerId,
  updateUserRoleAndContact,
  uploadVendorDocument,
  upsertVendorByOwnerId,
} from "@/lib/services/vendor-applications";
import { normalizeEmail } from "@/lib/utils/email";
import { normalizeToPhilippineE164 } from "@/lib/utils/phone";
import {
  validateVendorApplicationStepOne,
  validateVendorApplicationStepTwo,
} from "@/lib/utils/vendor-application-validation";

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

function validateStepOne(input: DraftInput, accountEmail?: string | null): string | null {
  return validateVendorApplicationStepOne(input, accountEmail);
}

function validateStepTwo(input: SubmitInput): string | null {
  return validateVendorApplicationStepTwo(input);
}

export async function saveVendorApplicationDraft(input: DraftInput): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false, error: "You need to log in again." };

  const stepOneError = validateStepOne(input, session.user.email);
  if (stepOneError) return { ok: false, error: stepOneError };

  try {
    await upsertVendorApplicationByOwnerId(session.user.id, {
      shop_name: input.shopName.trim() || null,
      shop_address: input.shopAddress.trim() || null,
      email: input.email.trim() || null,
      phone_number: normalizeToPhilippineE164(input.phoneNumber),
      vendor_type: input.vendorType,
      business_submission_timing: null,
      primary_business_document_type: input.vendorType === "pop-up" ? null : "DTI Certificate",
      government_id_type: input.governmentIdType || null,
      taxpayer_identification_number: input.vendorType === "pop-up" ? null : input.tin.trim() || null,
      vat_registration_status: input.vendorType === "pop-up" ? null : input.vatRegistrationStatus || null,
      submission_status: "draft",
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to save draft." };
  }

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

  try {
    await upsertVendorApplicationByOwnerId(session.user.id, {
      shop_name: input.shopName.trim(),
      shop_address: input.shopAddress.trim(),
      email: input.email.trim(),
      phone_number: normalizeToPhilippineE164(input.phoneNumber),
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
    });
    await updateUserRoleAndContact(session.user.id, normalizeToPhilippineE164(input.phoneNumber));
    await upsertVendorByOwnerId(session.user.id, input.shopName.trim(), input.vendorType);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to submit application." };
  }

  revalidatePath("/customer/vendor-application");

  return { ok: true };
}

export async function getVendorApplicationDraftForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false as const };

  try {
    const draft = await getVendorApplicationDraftByOwnerId(session.user.id);
    return { ok: true as const, draft };
  } catch {
    return { ok: false as const };
  }
}

export async function uploadVendorApplicationDocument(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false as const, error: "You need to log in again." };

  const file = formData.get("file");
  const documentType = formData.get("documentType");
  if (!(file instanceof File) || typeof documentType !== "string") {
    return { ok: false as const, error: "Invalid upload payload." };
  }

  try {
    const publicUrl = await uploadVendorDocument(session.user.id, file, documentType);
    return { ok: true as const, publicUrl };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to upload document.",
    };
  }
}
