import { redirect } from "next/navigation";

import { VendorPageShell } from "@/components/VendorPageShell";
import { PopUpSettings } from "@/features/vendors/components/settings/PopUpSettings";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";

export default async function VendorSettingsPage() {
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!commonProfile) redirect("/login");

  return (
    <VendorPageShell
      activeTab="settings"
      businessType={commonProfile.businessType}
      fixedMain
    >
      <PopUpSettings />
    </VendorPageShell>
  );
}
