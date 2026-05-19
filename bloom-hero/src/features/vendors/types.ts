export type BusinessType = "registered" | "unregistered";

export type VendorCommonProfile = {
  vendorId: string;
  businessType: BusinessType;
  holdsPopups: boolean;
  shopName: string;
  location: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  scheduleLabel: string;
  scheduleStart: string;
  scheduleEnd: string;
  about: string;
};

export type ActionResult = { ok: boolean; error?: string };

export type VendorSuspensionAppealStatus = "pending" | "approved" | "rejected";

export type VendorSuspensionState = {
  isSuspended: boolean;
  vendorId: string;
  shopName: string;
  suspensionReason: string;
  suspendedAt: string | null;
  pendingAppeal: {
    id: string;
    message: string;
    createdAt: string;
  } | null;
  lastResolvedAppeal: {
    status: VendorSuspensionAppealStatus;
    adminResponse: string | null;
    reviewedAt: string | null;
  } | null;
};
export type VendorStatus = "pending" | "approved" | "rejected";
export type VendorProfileByOwnerRow = {
  id: string;
  business_type: BusinessType | null;
  shop_name: string | null;
};

export type VendorApplicationVatStatus = "vat-registered" | "non-vat-registered";
export type VendorApplicationStepOneInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
};
export type VendorApplicationStepTwoInput = {
  businessType: BusinessType;
  governmentIdType: string;
  tin: string;
  vatRegistrationStatus: VendorApplicationVatStatus | "";
  primaryBusinessDocumentUrl: string | null;
  governmentIdDocumentUrl: string | null;
  birCertificateUrl: string | null;
};

export type VendorApplicationDraftRow = {
  shop_name: string | null;
  shop_address: string | null;
  email: string | null;
  phone_number: string | null;
  business_type: BusinessType | null;
  government_id_type: string | null;
  taxpayer_identification_number: string | null;
  vat_registration_status: VendorApplicationVatStatus | null;
  primary_business_document_url: string | null;
  government_id_document_url: string | null;
  bir_certificate_url: string | null;
  submission_status: string | null;
};

export const PHONE_PATTERN = /^\+63\d{9}$/;

export type CustomerVendorApplicationPageData = {
  initialEmail: string;
  initialPhoneNumber: string;
};
