import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card";
import VendorOrdersTable from "@/app/(vendor)/_components/VendorOrdersTable";

type VendorOrdersPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function VendorPopUpOrdersPage({
  searchParams,
}: VendorOrdersPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen bg-[#fbf7f4]">
      <div className="p-4 sm:p-6 lg:p-8">
        <VendorDashboardSidebarCard activeTab="orders" vendorType="pop-up" />
      </div>

      <section className="flex-1 space-y-4 px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mb-2">
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Review payment receipts and update delivery status.
            </p>
          </div>

          <VendorOrdersTable
            vendorType="pop-up"
            successMessage={params.success}
            errorMessage={params.error}
          />
      </section>
    </main>
  );
}
