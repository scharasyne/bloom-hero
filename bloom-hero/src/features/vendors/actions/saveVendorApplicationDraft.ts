// Source: `src/app/(customer)/vendor-application/actions.ts` (saveVendorApplicationDraft only)

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { upsertVendorApplicationByOwnerId } from "@/features/vendors/actions/upsertVendorApplication";
import { normalizeToPhilippineE164 } from "@/features/vendors/utils/phone";
import type { BusinessType, VendorApplicationVatStatus } from "@/features/vendors/types";
import { validateVendorApplicationStepOne } from "@/features/vendors/utils/validateVendorApplication";

type DraftInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
  businessType: BusinessType;
  governmentIdType: string;
  tin: string;
  vatRegistrationStatus: VendorApplicationVatStatus | "";
};

type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function saveVendorApplicationDraft(input: DraftInput): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ok: false, error: "You need to log in again." };

  const stepOneError = validateVendorApplicationStepOne(input, session.user.email);
  if (stepOneError) return { ok: false, error: stepOneError };

  const isUnregistered = input.businessType === "unregistered";

  try {
    await upsertVendorApplicationByOwnerId(session.user.id, {
      shop_name: input.shopName.trim() || null,
      shop_address: input.shopAddress.trim() || null,
      email: input.email.trim() || null,
      phone_number: normalizeToPhilippineE164(input.phoneNumber),
      business_type: input.businessType,
      business_submission_timing: null,
      primary_business_document_type: isUnregistered ? null : "DTI Certificate",
      government_id_type: input.governmentIdType || null,
      taxpayer_identification_number: isUnregistered ? null : input.tin.trim() || null,
      vat_registration_status: isUnregistered ? null : input.vatRegistrationStatus || null,
      submission_status: "draft",
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to save draft." };
  }

  revalidatePath("/customer/vendor-application");
  return { ok: true };
}
