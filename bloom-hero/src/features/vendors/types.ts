export type BusinessType = "registered" | "unregistered";
type VendorType = "market" | "pop-up";
type VatRegistrationStatus = "vat-registered" | "non-vat-registered";

export type VendorCommonProfile = {
  vendorId: string;
  businessType: BusinessType;
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
export type VendorStatus = "pending" | "approved" | "rejected";
export type VendorLegacyType = "market" | "pop-up";
export type VendorProfileByOwnerRow = {
  vendor_type: VendorLegacyType | null;
  shop_name: string | null;
};

export type VendorApplicationType = VendorLegacyType;
export type VendorApplicationVatStatus = "vat-registered" | "non-vat-registered";
export type VendorApplicationStepOneInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
};
export type VendorApplicationStepTwoInput = {
  vendorType: VendorApplicationType;
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
  vendor_type: VendorType | null;
  government_id_type: string | null;
  taxpayer_identification_number: string | null;
  vat_registration_status: VatRegistrationStatus | null;
  primary_business_document_url: string | null;
  government_id_document_url: string | null;
  bir_certificate_url: string | null;
  submission_status: string | null;
};

export const PHONE_PATTERN = /^\+63\d{9}$/;