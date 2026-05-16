import type { BusinessType } from "../types";

// Registered vendors may manage catalog and orders. Unregistered vendors may not.
export function canManageCatalog(businessType: BusinessType) {
  return businessType === "registered";
}
