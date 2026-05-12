import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import { VendorDashboardContent } from "@/app/(vendor)/_components/VendorMarketDashboardContent";
import { getVendorStatusByOwner } from "@/features/vendors/queries/getVendorStatus";


type VendorStatus = "pending" | "approved" | "rejected";

export default async function VendorPopUpDashboardPage() {
  const status = (await getVendorStatusByOwner("pop-up")) as VendorStatus | null;
  if (!status) redirect("/login");
  if (status === "rejected") redirect("/customer/dashboard");

  return (
    <main className="flex min-h-screen bg-[#fbf7f4] text-[#1f1f1f]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="pop-up" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="flex flex-col gap-6">
        {status === "pending" && (
          <div className="flex gap-4 items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Application Pending</h3>
              <p className="text-sm text-yellow-800">
                Your vendor application is currently under review. Some features will be unavailable until your application is approved.
              </p>
            </div>
          </div>
        )}
        {status === "approved" && <VendorDashboardContent vendorType="pop-up" />}
        </div>
      </div>
    </main>
  );
};