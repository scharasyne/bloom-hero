// Source: `src/app/(customer)/settings/page.tsx`

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getCustomerSettingsByUserId } from "@/features/customers/queries/getCustomerSetting";
import { getUserBasicProfileById } from "@/features/users/queries/getUserBasicProfile";
import type { CustomerSettingsPageData } from "@/features/customers/types";

export async function getCustomerSettingsPage(): Promise<CustomerSettingsPageData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const [userProfile, customerProfile] = await Promise.all([
    getUserBasicProfileById(session.user.id),
    getCustomerSettingsByUserId(session.user.id),
  ]);

  return {
    initialName: userProfile?.name ?? "",
    initialEmail: session.user.email ?? userProfile?.email ?? "",
    initialContactNumber: userProfile?.contact_number ?? "",
    initialShippingAddress: customerProfile?.shipping_address ?? "",
    initialProfilePhotoUrl: customerProfile?.profile_photo_url ?? "",
    initialNotificationPreferences: {
      order_updates: customerProfile?.notification_preferences?.order_updates ?? true,
      promotions: customerProfile?.notification_preferences?.promotions ?? false,
    },
  };
}

export async function requireCustomerSettingsPage(): Promise<CustomerSettingsPageData> {
  const data = await getCustomerSettingsPage();
  if (!data) {
    redirect("/login");
  }
  return data;
}
