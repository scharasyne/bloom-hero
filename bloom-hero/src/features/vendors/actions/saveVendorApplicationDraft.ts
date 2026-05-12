// Source: `src/app/(customer)/vendor-application/actions.ts` (saveVendorApplicationDraft only)

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { upsertVendorApplicationByOwnerId } from "@/features/vendors/actions/upsertVendorApplication";
import { normalizeToPhilippineE164 } from "@/features/vendors/utils/phone";
import {
  validateVendorApplicationStepOne,
} from "@/features/vendors/utils/validateVendorApplication";

/*
  CHANGE THE TYPES FROM WHAT'S ALREADY EXISTING
  NO NEED TO DECLARE NEW ONES
*/

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

type ActionResult = {
  ok: boolean;
  error?: string;
};

function validateStepOne(input: DraftInput, accountEmail?: string | null): string | null {
  return validateVendorApplicationStepOne(input, accountEmail);
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
