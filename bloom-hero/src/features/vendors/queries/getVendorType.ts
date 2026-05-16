import { getVendorProfileByOwnerId } from "./getVendorProfileByOwnerId";
import type { BusinessType } from "../types";

export async function getBusinessTypeByOwnerId(ownerId: string) {
  const vendor = await getVendorProfileByOwnerId(ownerId);
  return vendor?.business_type as BusinessType | null | undefined;
}
