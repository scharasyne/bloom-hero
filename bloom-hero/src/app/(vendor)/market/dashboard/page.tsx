import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import { VendorMarketDashboardContent } from "@/app/(vendor)/_components/VendorMarketDashboardContent";
import { getVendorStatusByOwner } from "@/lib/vendors/common/actions";

type VendorStatus = "pending" | "approved" | "rejected";

export default async function VendorMarketDashboardPage() {
  const status = (await getVendorStatusByOwner("market")) as VendorStatus | null;
  if (!status) redirect("/login");
  if (status === "rejected") redirect("/customer/dashboard");

  return (
    <main className="flex">
      <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
      </div>

      <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your shop.
          </p>
        </div>

        {/* Pending banner */}
        {status === "pending" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">Application Pending</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-yellow-700">
                Your vendor application is currently under review. Some features will be
                unavailable until your application is approved.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard widgets — only shown when approved */}
        {status === "approved" && <VendorMarketDashboardContent />}
      </div>
    </main>
  );
}