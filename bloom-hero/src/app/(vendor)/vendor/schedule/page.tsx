import { redirect } from "next/navigation";

import { VendorDashboardSidebarCard } from "@/features/vendors/components/VendorDashboardSidebarCard";
import PopUpScheduleClient from "@/features/pop-up/components/PopUpScheduleClient";
import { createPopUpSchedule } from "@/features/pop-up/actions/createPopupSchedule";
import { getPopUpSchedule } from "@/features/pop-up/queries/getPopupSchedule";
import { getRecentPopUpLocationRequests } from "@/features/pop-up/queries/getRecentPopupLocationRequests";
import { getRequestedLocationRanking } from "@/features/pop-up/queries/getTopRequestedLocation";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";

export default async function VendorSchedulePage() {
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!commonProfile) redirect("/login");
  const vendorId = commonProfile.vendorId;

  const [ranking, upcoming, recentRequests] = await Promise.all([
    getRequestedLocationRanking(vendorId),
    getPopUpSchedule(vendorId),
    getRecentPopUpLocationRequests(vendorId, 5),
  ]);
  const topRequested = ranking.slice(0, 4);

  return (
    <div
      className="flex min-h-screen bg-[#fbf7f4] text-[#1f1f1f]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="schedule" businessType={commonProfile.businessType} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <PopUpScheduleClient
              vendorId={vendorId}
              topRequested={topRequested}
              ranking={ranking}
              recentRequests={recentRequests}
              initialUpcoming={upcoming}
              createScheduleAction={createPopUpSchedule}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
