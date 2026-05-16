// Source: `src/app/(vendor)/_components/vendor-orders-content.tsx`

"use client"

import { useMemo, useState } from "react"
import { VendorOrdersFilters } from "@/features/orders/components/VendorOrdersFilters"
import { VendorOrdersKpis } from "@/features/orders/components/VendorOrdersKpis"
import {
  VendorOrdersTable,
  type VendorOrderRow,
} from "@/features/orders/vendor-orders-table"

export type VendorOrderFilter =
  | "All"
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled"

type VendorOrdersContentProps = {
  orders: VendorOrderRow[]
}

export function VendorOrdersContent({
  orders,
}: VendorOrdersContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<VendorOrderFilter>("All")

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All" ? true : order.status === activeFilter

      const searchableText = [
        order.id,
        order.customerName,
        order.location,
        order.date,
        ...order.items,
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : searchableText.includes(normalizedSearch)

      return matchesFilter && matchesSearch
    })
  }, [orders, searchTerm, activeFilter])

  const totalOrders = orders.length
  const pendingCount = orders.filter((order) => order.status === "Pending").length
  const completedCount = orders.filter(
    (order) => order.status === "Completed"
  ).length
  const revenue = orders
    .filter((order) => order.status === "Completed")
    .reduce((sum, order) => sum + order.amount, 0)

  return (
    <div
      className="w-full space-y-6"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1e1c1a]">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[#8a847d]">
            Track, manage, and fulfill customer purchases.
          </p>
        </div>
      </div>

      <VendorOrdersKpis
        totalOrders={totalOrders}
        pendingCount={pendingCount}
        completedCount={completedCount}
        revenue={revenue}
      />

      <VendorOrdersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <VendorOrdersTable orders={filteredOrders} />
    </div>
  )
}