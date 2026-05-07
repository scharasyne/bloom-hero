import { redirect } from "next/navigation";
import PopUpScheduleClient from "@/app/(vendor)/_components/PopUpScheduleClient";
import {
  createPopUpSchedule,
  getPopUpSchedule,
  getRecentPopUpLocationRequests,
  getRequestedLocationRanking,
} from "@/lib/vendors/vendor-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function PopUpDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: vendor, error } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .eq("vendor_type", "pop-up")
    .maybeSingle();

  if (error || !vendor) redirect("/customer/dashboard");

  const [ranking, upcoming, recentRequests] = await Promise.all([
    getRequestedLocationRanking(vendor.id),
    getPopUpSchedule(vendor.id),
    getRecentPopUpLocationRequests(vendor.id, 5),
  ]);
  const topRequested = ranking.slice(0, 4);

  return (
    <div
      className="flex min-h-screen bg-[#fbf7f4] text-[#1f1f1f]"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <PopUpScheduleClient
              vendorId={vendor.id}
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