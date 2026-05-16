import {
  VendorOrdersStatusPill,
  type VendorOrderStatus,
} from "@/features/orders/components/VendorOrdersStatusPill"

export type VendorOrderRow = {
  id: string
  customerName: string
  location: string
  items: string[]
  date: string
  amount: number
  status: VendorOrderStatus
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function VendorOrdersTable({
  orders,
}: {
  orders: VendorOrderRow[]
}) {
  if (orders.length === 0) {
    return (
      <section className="mt-6 rounded-2xl border border-[#ebe7e3] bg-white p-10 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4efe9] text-[#8a847d]">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h18" />
              <path d="M6 3h12l1 4H5l1-4Z" />
              <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
              <path d="M9 11h6" />
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-[#1e1c1a]">
            No matching orders found
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#8a847d]">
            Try adjusting your search term or selected status filter to see more
            results.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#ebe7e3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="hidden grid-cols-[1fr_1.1fr_1.2fr_0.9fr_0.8fr_0.8fr] gap-4 border-b border-[#efe9e3] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a847d] md:grid">
        <p>Order</p>
        <p>Customer</p>
        <p>Items</p>
        <p>Date</p>
        <p>Amount</p>
        <p>Status</p>
      </div>

      <div className="divide-y divide-[#f1ece7]">
        {orders.map((order) => (
          <article
            key={order.id}
            className="px-5 py-4 transition-colors hover:bg-[#fcfbf9]"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_1.1fr_1.2fr_0.9fr_0.8fr_0.8fr] md:items-center">
              <div>
                <p className="text-sm font-semibold text-[#1e1c1a]">{order.id}</p>
                <p className="text-xs text-[#8a847d]">{order.items.length} items</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#1e1c1a]">
                  {order.customerName}
                </p>
                <p className="text-xs text-[#8a847d]">{order.location}</p>
              </div>

              <div>
                <p className="line-clamp-2 text-sm text-[#6f6a64]">
                  {order.items.join(", ")}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#6f6a64]">{order.date}</p>
              </div>

              <div>
                <p className="text-sm font-semibold tabular-nums text-[#1e1c1a]">
                  {formatPeso(order.amount)}
                </p>
              </div>

              <div>
                <VendorOrdersStatusPill status={order.status} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}