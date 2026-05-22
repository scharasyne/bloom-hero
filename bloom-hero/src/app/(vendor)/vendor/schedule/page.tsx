import { redirect } from "next/navigation";

import { VendorPageShell } from "@/components/VendorPageShell";
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
    <VendorPageShell
      activeTab="schedule"
      businessType={commonProfile.businessType}
      fixedMain
    >
      <div className="mx-auto w-full max-w-6xl min-h-0 flex-1 overflow-y-auto scrollbar-thin-oval">
        <PopUpScheduleClient
          vendorId={vendorId}
          topRequested={topRequested}
          ranking={ranking}
          recentRequests={recentRequests}
          initialUpcoming={upcoming}
          createScheduleAction={createPopUpSchedule}
        />
      </div>
    </VendorPageShell>
  );
}
