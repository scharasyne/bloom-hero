import Link from "next/link"

type VendorDashboardSidebarCardProps = {
  activeTab?: "dashboard" | "products" | "orders" | "messages" | "profile"
}

const tabs: Array<{
  id: "dashboard" | "products" | "orders" | "messages" | "profile"
  label: string
}> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "messages", label: "Messages" },
  { id: "profile", label: "Profile" },
]

const tabRoutes: Partial<
  Record<"dashboard" | "products" | "orders" | "messages" | "profile", string>
> = {
  dashboard: "/vendor/market/dashboard",
  products: "/vendor/market/list-product",
}

export function VendorDashboardSidebarCard({
  activeTab = "products",
}: VendorDashboardSidebarCardProps) {
  return (
    <aside className="w-full rounded-2xl border bg-card p-5 shadow-sm md:max-w-55">
      <nav aria-label="Vendor dashboard navigation">
        <ul className="space-y-3">
          {tabs.map((tab) => {
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
