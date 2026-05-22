import Link from "next/link";
import { redirect } from "next/navigation";

import { VendorPageShell } from "@/components/VendorPageShell";
import VendorOrdersTable from "@/features/orders/components/VendorOrdersTable";
import { VendorCatalogBlockedPanel } from "@/features/vendors/components/VendorCatalogBlockedPanel";
import { getVendorCommonProfileByOwner } from "@/features/vendors/queries/getVendorCommonProfile";
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess";

type VendorOrdersPageProps = {
  searchParams: Promise<{ success?: string; error?: string; status?: string }>;
};

function OrdersHeader() {
  return (
    <div className="mb-6">
      <h1 className="page-title">Orders</h1>
      <p className="text-sm text-muted-foreground">
        Review payment receipts and update delivery status.
      </p>
    </div>
  );
}

export default async function VendorOrdersPage({ searchParams }: VendorOrdersPageProps) {
  const commonProfile = await getVendorCommonProfileByOwner();
  if (!commonProfile) redirect("/login");

  if (!canManageCatalog(commonProfile.businessType)) {
    return (
      <VendorPageShell activeTab="orders" businessType={commonProfile.businessType}>
        <OrdersHeader />
        <VendorCatalogBlockedPanel
          title="Register your business!"
          description="Order management unlocks after you register your business with BloomHero."
        />
      </VendorPageShell>
    );
  }

  const params = await searchParams;
  const activeStatus =
    params.status === "to_pay" ||
    params.status === "to_ship" ||
    params.status === "to_receive"
      ? params.status
      : "all";
  const statusButtons = [
    { key: "all", label: "All" },
    { key: "to_pay", label: "To Pay" },
    { key: "to_ship", label: "To Ship" },
    { key: "to_receive", label: "To Receive" },
  ];

  return (
    <VendorPageShell activeTab="orders" businessType={commonProfile.businessType}>
      <OrdersHeader />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusButtons.map((button) => {
          const isActive = activeStatus === button.key;
          const href = button.key === "all" ? "?" : `?status=${button.key}`;

          return (
            <Link
              key={button.key}
              href={href}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#2f5d3a] bg-[#2f5d3a] text-white"
                  : "border-[#dad5cc] bg-white text-[#5f5a55] hover:border-[#2f5d3a] hover:text-[#2f5d3a]"
              }`}
            >
              {button.label}
            </Link>
          );
        })}
      </div>

      <VendorOrdersTable
        successMessage={params.success}
        errorMessage={params.error}
        statusFilter={activeStatus}
      />
    </VendorPageShell>
  );
}
