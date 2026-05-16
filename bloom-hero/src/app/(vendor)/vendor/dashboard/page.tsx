import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { VendorPageShell } from "@/components/VendorPageShell";
import { VendorDashboardContent } from "@/features/vendors/components/VendorDashboardContent";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";
import { getVendorStatusByOwner } from "@/features/vendors/queries/getVendorStatus";
import type { VendorStatus } from "@/features/vendors/types";

export default async function VendorDashboardPage() {
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!commonProfile) redirect("/login");

  const status = (await getVendorStatusByOwner()) as VendorStatus | null;
  if (!status) redirect("/login");
  if (status === "rejected") redirect("/customer/dashboard");

  return (
    <VendorPageShell activeTab="dashboard" businessType={commonProfile.businessType}>
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your shop.</p>
      </div>
      {status === "pending" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900">Application Pending</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-yellow-700">
              Your vendor application is currently under review. Some features will be unavailable until your application is approved.
            </p>
          </div>
        </div>
      )}
      {status === "approved" && commonProfile.businessType === "registered" ? (
        <VendorDashboardContent />
      ) : status === "approved" ? (
        <div className="rounded-2xl border border-[#ebe7e3] bg-white px-5 py-4 text-sm text-[#4c4742]">
          Use Schedule and Profile to manage pop-ups. Product and order tools unlock after business registration.
        </div>
      ) : null}
    </VendorPageShell>
  );
}
