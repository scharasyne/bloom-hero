import { VendorDashboardSidebarCard } from "@/components/vendor-dashboard-sidebar-card";

export default function MarketVendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <VendorDashboardSidebarCard vendorType="market" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}