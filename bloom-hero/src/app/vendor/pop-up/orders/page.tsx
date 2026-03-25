import { VendorDashboardSidebarCard } from "@/app/vendor/_components/vendor-dashboard-sidebar-card";
import VendorOrdersTable from "@/app/vendor/_components/VendorOrdersTable";

type VendorOrdersPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function VendorPopUpOrdersPage({
  searchParams,
}: VendorOrdersPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <VendorDashboardSidebarCard activeTab="orders" vendorType="pop-up" />

        <section className="space-y-4">
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
      </div>
    </main>
  );
}
