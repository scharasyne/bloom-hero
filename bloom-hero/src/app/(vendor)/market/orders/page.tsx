import { redirect } from "next/navigation"
import { VendorDashboardSidebarCard } from "@/app/(vendor)/_components/vendor-dashboard-sidebar-card"
import { VendorOrdersContent } from "@/app/(vendor)/_components/vendor-orders-content"
import type { VendorOrderRow } from "@/app/(vendor)/_components/vendor-orders-table"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"


type VendorOrderQueryRow = {
  id: string
  customer_id: string | null
  order_date: string | null
  total_amount: number | null
  status: string | null
  order_items:
    | {
        products:
          | {
              product_name: string | null
            }[]
          | null
      }[]
    | null
}

function formatOrderDate(value: string | null) {
  if (!value) return "No date"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "No date"

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function mapOrderStatus(status: string | null): VendorOrderRow["status"] {
  switch (status?.toLowerCase()) {
    case "processing":
    case "preparing":
      return "Preparing"
    case "ready":
      return "Ready"
    case "completed":
      return "Completed"
    case "cancelled":
    case "canceled":
      return "Cancelled"
    default:
      return "Pending"
  }
}

export default async function VendorMarketOrdersPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .eq("vendor_type", "market")
    .maybeSingle()

  if (vendorError || !vendor) {
    throw new Error(vendorError?.message || "Vendor profile not found.")
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_id,
        order_date,
        total_amount,
        status,
        order_items(
          products(product_name)
        )
      `
    )
    .eq("vendor_id", vendor.id)
    .order("order_date", { ascending: false })

  if (ordersError) {
    throw new Error(ordersError.message)
  }

  const orders: VendorOrderRow[] = ((ordersData ?? []) as VendorOrderQueryRow[]).map(
    (order) => {
      const items = (order.order_items ?? [])
        .map((item) => item.products?.[0]?.product_name?.trim())
        .filter((item): item is string => Boolean(item))

      return {
        id: `#ORD-${order.id.slice(0, 8).toUpperCase()}`,
        customerName: order.customer_id
          ? `Customer ${order.customer_id.slice(0, 6).toUpperCase()}`
          : "Customer",
        location: "Location unavailable",
        items: items.length > 0 ? items : ["No items"],
        date: formatOrderDate(order.order_date),
        amount: Number(order.total_amount) || 0,
        status: mapOrderStatus(order.status),
      }
    }
  )

  return (
    <main className="flex bg-[#f7f4f1]">
      <div className="lg:p-6">
        <VendorDashboardSidebarCard activeTab="orders" vendorType="market" />
      </div>

      <div className="w-full p-4 md:p-6 lg:pl-2 lg:pr-10 sm:pt-20">
        <VendorOrdersContent orders={orders} />
      </div>
    </main>
  )
}