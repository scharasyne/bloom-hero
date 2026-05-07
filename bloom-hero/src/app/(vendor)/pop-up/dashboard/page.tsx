import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { VendorPopUpDashboardContent } from "@/app/(vendor)/_components/vendor-popup-dashboard-content";
import { getVendorStatusByOwner } from "@/lib/vendors/common/actions";

type VendorStatus = "pending" | "approved" | "rejected";

export default async function VendorPopUpDashboardPage() {
  const status = (await getVendorStatusByOwner("pop-up")) as VendorStatus | null;

  if (!status) redirect("/login");
  if (status === "rejected") redirect("/customer/dashboard");

  return (
    <main
      className="w-full bg-[#fbf7f4] px-4 pb-6 pt-4 text-[#1f1f1f] sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[#7a746e]">
          Here&apos;s what&apos;s happening with your upcoming pop-ups.
        </p>
      </div>

      {status === "pending" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900">Application Pending</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-yellow-800">
              Your vendor application is currently under review. Some features will be unavailable until your application is approved.
            </p>
          </div>
        </div>
      )}

      {status === "approved" && <VendorPopUpDashboardContent />}
    </main>
  );
}