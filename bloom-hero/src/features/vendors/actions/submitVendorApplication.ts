// Source: `src/app/(customer)/vendor-application/actions.ts` (submitVendorApplication only)

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { upsertVendorApplicationByOwnerId } from "@/features/vendors/actions/upsertVendorApplication";
import { updateUserRoleAndContact } from "@/features/users/actions/updateUserRoleAndContact";
import { upsertVendorByOwnerId } from "@/features/vendors/actions/upsertVendorOwnerById";
import { normalizeToPhilippineE164 } from "@/features/vendors/utils/phone";
import type { BusinessType, VendorApplicationVatStatus } from "@/features/vendors/types";
import {
  validateVendorApplicationStepOne,
  validateVendorApplicationStepTwo,
} from "@/features/vendors/utils/validateVendorApplication";

type SubmitInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
  businessType: BusinessType;
  governmentIdType: string;
  tin: string;
  vatRegistrationStatus: VendorApplicationVatStatus | "";
  primaryBusinessDocumentUrl: string | null;
  governmentIdDocumentUrl: string | null;
  birCertificateUrl: string | null;
};

type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function submitVendorApplication(input: SubmitInput): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false, error: "You need to log in again." };

  const stepOneError = validateVendorApplicationStepOne(input, session.user.email);
  if (stepOneError) return { ok: false, error: stepOneError };

  const stepTwoError = validateVendorApplicationStepTwo(input);
  if (stepTwoError) return { ok: false, error: stepTwoError };

  const isUnregistered = input.businessType === "unregistered";

  try {
    await upsertVendorApplicationByOwnerId(session.user.id, {
      shop_name: input.shopName.trim(),
      shop_address: input.shopAddress.trim(),
      email: input.email.trim(),
      phone_number: normalizeToPhilippineE164(input.phoneNumber),
      business_type: input.businessType,
      business_submission_timing: null,
      primary_business_document_type: isUnregistered ? null : "DTI Certificate",
      primary_business_document_url: isUnregistered ? null : input.primaryBusinessDocumentUrl,
      government_id_type: input.governmentIdType,
      government_id_document_url: input.governmentIdDocumentUrl,
      taxpayer_identification_number: isUnregistered ? null : input.tin.trim(),
      vat_registration_status: isUnregistered ? null : input.vatRegistrationStatus,
      bir_certificate_url: isUnregistered ? null : input.birCertificateUrl,
      submission_status: "submitted",
      submitted_at: new Date().toISOString(),
    });
    await updateUserRoleAndContact(session.user.id, normalizeToPhilippineE164(input.phoneNumber));
    await upsertVendorByOwnerId(session.user.id, input.shopName.trim(), input.businessType);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to submit application." };
  }

  revalidatePath("/customer/vendor-application");

  return { ok: true };
}
