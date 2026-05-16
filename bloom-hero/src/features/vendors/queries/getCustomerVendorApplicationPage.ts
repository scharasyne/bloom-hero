// Source: `src/app/(customer)/vendor-application/page.tsx`

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getUserBasicProfileById } from "@/features/users/queries/getUserBasicProfile";
import type { CustomerVendorApplicationPageData } from "@/features/vendors/types";

export async function getCustomerVendorApplicationPage(): Promise<CustomerVendorApplicationPageData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const userProfile = await getUserBasicProfileById(session.user.id);

  return {
    initialEmail: userProfile?.email ?? session.user.email ?? "",
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
