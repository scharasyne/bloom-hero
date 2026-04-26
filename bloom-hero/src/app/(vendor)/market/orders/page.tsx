import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import VendorOrdersTable from "@/app/(vendor)/_components/VendorOrdersTable";

type VendorOrdersPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function VendorMarketOrdersPage({
  searchParams,
}: VendorOrdersPageProps) {
  const params = await searchParams;

  return (
    <main className="flex">
      <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="orders" vendorType="market" />
      </div>

      <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Review payment receipts and update delivery status.
          </p>
        </div>

        <VendorOrdersTable
          vendorType="market"
          successMessage={params.success}
          errorMessage={params.error}
        />
      </div>
    </main>
  );
}
