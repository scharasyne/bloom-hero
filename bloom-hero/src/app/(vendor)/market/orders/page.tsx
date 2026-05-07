import Link from "next/link";
import VendorOrdersTable from "@/app/(vendor)/_components/VendorOrdersTable";

type VendorOrdersPageProps = {
  searchParams: Promise<{ success?: string; error?: string; status?: string }>;
};

export default async function VendorMarketOrdersPage({
  searchParams,
}: VendorOrdersPageProps) {
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
    <main className="flex">
      <div className="lg:p-6">
      </div>

      <div className="w-full p-4 lg:pl-2 lg:pr-10 md:p-6 sm:pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Review payment receipts and update delivery status.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {statusButtons.map((button) => {
            const isActive = activeStatus === button.key;
            const href =
              button.key === "all" ? "?" : `?status=${button.key}`;

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
          vendorType="market"
          successMessage={params.success}
          errorMessage={params.error}
          statusFilter={activeStatus}
        />
      </div>
    </main>
  );
}
