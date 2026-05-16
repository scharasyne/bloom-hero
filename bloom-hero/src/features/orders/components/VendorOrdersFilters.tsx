// Source: `src/app/(vendor)/_components/vendor-orders-filters.tsx`

import type { VendorOrderFilter } from "@/features/orders/components/VendorOrdersContent"

const STATUSES: VendorOrderFilter[] = [
  "All",
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
]

type VendorOrdersFiltersProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  activeFilter: VendorOrderFilter
  onFilterChange: (value: VendorOrderFilter) => void
}

export function VendorOrdersFilters({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: VendorOrdersFiltersProps) {
  return (
    <section className="mt-6 rounded-2xl border border-[#ebe7e3] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order ID, customer, item..."
            className="h-11 w-full rounded-xl border border-[#e7e1db] bg-[#fcfbf9] px-4 text-sm text-[#1e1c1a] outline-none placeholder:text-[#a29b94] focus:border-[#2f5d3a]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => {
            const isActive = activeFilter === status

            return (
              <button
                key={status}
                type="button"
                onClick={() => onFilterChange(status)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#2f5d3a] text-white hover:bg-[#26492f]"
                    : "border border-[#e4ddd6] bg-[#faf9f7] text-[#6f6a64] hover:bg-[#f3f0ec] hover:text-[#1e1c1a]",
                ].join(" ")}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}