// Source: `src/app/(customer)/vendor-application/page.tsx`

import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getUserBasicProfileById } from "@/features/users/queries/getUserBasicProfile";
import type { CustomerVendorApplicationPageData } from "@/features/vendors/types";

export async function getCustomerVendorApplicationPage(): Promise<CustomerVendorApplicationPageData | null> {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  const userProfile = await getUserBasicProfileById(user.id);

  return {
    initialEmail: userProfile?.email ?? user.email ?? "",
    initialPhoneNumber: userProfile?.contact_number ?? "",
  };
}

export async function requireCustomerVendorApplicationPage(): Promise<CustomerVendorApplicationPageData> {
  const data = await getCustomerVendorApplicationPage();
  if (!data) {
    redirect("/login");
  }
  return data;
}
