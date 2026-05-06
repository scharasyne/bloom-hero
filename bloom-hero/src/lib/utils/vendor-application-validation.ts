import { isValidEmail, normalizeEmail } from "@/lib/utils/email";

type VendorType = "market" | "pop-up";
type VatRegistrationStatus = "vat-registered" | "non-vat-registered";

type StepOneInput = {
  shopName: string;
  shopAddress: string;
  email: string;
  phoneNumber: string;
};

type StepTwoInput = {
  vendorType: VendorType;
  governmentIdType: string;
  tin: string;
  vatRegistrationStatus: VatRegistrationStatus | "";
  primaryBusinessDocumentUrl: string | null;
  governmentIdDocumentUrl: string | null;
  birCertificateUrl: string | null;
};

export function validateVendorApplicationStepOne(input: StepOneInput, accountEmail?: string | null) {
  if (!input.shopName.trim()) return "Shop Name is required.";
  if (!input.shopAddress.trim()) return "Shop Address is required.";
  if (!input.email.trim()) return "Business email is required.";
  if (!isValidEmail(input.email)) return "Please enter a valid business email.";
  if (accountEmail && normalizeEmail(input.email) === normalizeEmail(accountEmail)) {
    return "Business email must be different from your account email.";
  }
  if (!/^\d{10}$/.test(input.phoneNumber.trim())) return "Phone Number must be exactly 10 digits.";
  return null;
}

export function validateVendorApplicationStepTwo(input: StepTwoInput) {
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
