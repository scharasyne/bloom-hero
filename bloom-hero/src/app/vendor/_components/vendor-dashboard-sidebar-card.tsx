import Link from "next/link"

type TabId = "dashboard" | "products" | "orders" | "messages" | "profile" | "schedule"
type VendorType = "market" | "pop-up"

type VendorDashboardSidebarCardProps = {
  activeTab?: TabId
  vendorType: VendorType
}

const tabs: Record<"pop-up" | "market", Array<{ id: TabId; label: string }>> = {
  'pop-up': [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },    
    { id: "schedule", label: "Schedule"},
  ],
  'market': [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "messages", label: "Messages" },
    { id: "profile", label: "Profile" },
  ]
}

function getTabRoutes(vendorType: VendorType): Partial<Record<TabId, string>> {
  return {
    dashboard: `/vendor/${vendorType}/dashboard`,
    products: `/vendor/${vendorType}/list-product`,
  }
}

export function VendorDashboardSidebarCard({
  activeTab,
  vendorType,
}: VendorDashboardSidebarCardProps) {
  const tabRoutes = getTabRoutes(vendorType)
  return (
    <aside className="w-full rounded-2xl border bg-card p-5 shadow-sm md:max-w-55">
      <nav aria-label="Vendor dashboard navigation">
        <ul className="space-y-3">
          {tabs[vendorType].map((tab) => {
            const isActive = tab.id === activeTab
            const sharedClassName = [
              "block rounded-md px-3 py-2 text-lg",
              isActive
                ? "border-l-2 border-red-400 text-red-500"
                : "text-foreground/90 hover:bg-muted",
            ].join(" ")

            const route = tabRoutes[tab.id]

            if (route) {
              return (
                <li key={tab.id}>
                  <Link href={route} className={sharedClassName}>
                    {tab.label}
                  </Link>
                </li>
              )
            }

            return (
              <li key={tab.id}>
                <span className={sharedClassName}>{tab.label}</span>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
