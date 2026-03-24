import { VendorDashboardSidebarCard } from "@/app/vendor/_components/vendor-dashboard-sidebar-card";
import VendorDashboardContent from "@/app/vendor/_components/VendorDashboardContent";

export default function VendorMarketDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />
        <VendorDashboardContent />
      </div>
    </main>
  );
}