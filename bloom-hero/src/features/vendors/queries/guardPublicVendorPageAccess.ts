import { redirect } from "next/navigation";

import { getSession } from "@/features/auth/queries/getSession";
import { getVendorProfileByOwnerId } from "@/features/vendors/queries/getVendorProfileByOwnerId";

/** Vendors may only open `/vendors/:id` for their own shop (preview). */
export async function guardPublicVendorPageAccess(vendorId: string) {
  const session = await getSession();
  if (session.profile?.role !== "vendor" || !session.user) {
    return;
  }

  const ownVendor = await getVendorProfileByOwnerId(session.user.id);
  if (!ownVendor || ownVendor.id !== vendorId) {
    redirect("/vendor/dashboard");
  }
}
