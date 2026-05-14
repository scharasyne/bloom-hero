import { redirect } from "next/navigation";

import { PopUpSettings } from "@/features/vendors/components/settings/PopUpSettings";
import { VendorDashboardSidebarCard } from "@/features/vendors/components/VendorDashboardSidebarCard";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";

export default async function VendorSettingsPage() {
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!commonProfile) redirect("/login");

  return (
    <main className="flex min-h-screen bg-[#fbf7f4]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="settings" businessType={commonProfile.businessType} />
      </div>
      <div className="flex-1 overflow-hidden px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        <PopUpSettings />
      </div>
    </main>
  );
}
