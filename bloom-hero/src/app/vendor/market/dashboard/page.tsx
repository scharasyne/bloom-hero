
import { VendorDashboardSidebarCard } from "@/components/vendor-dashboard-sidebar-card"

export default function VendorMarketDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <VendorDashboardSidebarCard activeTab="dashboard" />

        <div className="mb-8 flex flex-col justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Here's what's happening with your shop.
            </p>
          </div>
      </div>
    </main>
  )
}