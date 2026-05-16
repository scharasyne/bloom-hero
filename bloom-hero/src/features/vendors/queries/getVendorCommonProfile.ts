import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getCachedVendorCommonProfile } from "@/features/vendors/queries/getCachedVendorCommonProfile";
import type { VendorCommonProfile } from "../types";

export async function getVendorCommonProfileByOwner(): Promise<VendorCommonProfile | null> {
  const user = await getAuthUser();
  if (!user) return null;

  const profile = await getCachedVendorCommonProfile(user.id);
  if (!profile) {
    throw new Error("Vendor profile not found.");
  }

  return profile;
}
