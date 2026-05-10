export type BusinessType = "registered" | "unregistered";

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

export const PHONE_PATTERN = /^\+63\d{9}$/;