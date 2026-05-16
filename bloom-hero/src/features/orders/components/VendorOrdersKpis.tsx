// Source: `src/app/(vendor)/_components/vendor-orders-kpis.tsx`


type OrdersKpiProps = {
  totalOrders: number
  pendingCount: number
  completedCount: number
  revenue: number
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function VendorOrdersKpis({
  totalOrders,
  pendingCount,
  completedCount,
  revenue,
}: OrdersKpiProps) {
  const cards = [
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      helper: "All time",
    },
    {
      label: "Pending",
      value: pendingCount.toLocaleString(),
      helper: "Awaiting fulfillment",
    },
    {
      label: "Completed",
      value: completedCount.toLocaleString(),
      helper: "Successfully fulfilled",
    },
    {
      label: "Revenue",
      value: formatPeso(revenue),
      helper: "From completed orders",
    },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="relative overflow-hidden rounded-2xl border border-[#ebe7e3] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#e4efe6] via-[#f3ede6] to-[#e4efe6]" />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a847d]">
            {card.label}
          </p>
          <p className="mt-1 text-[26px] font-bold tracking-tight text-[#1e1c1a] tabular-nums">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-[#a39c94]">{card.helper}</p>
        </article>
      ))}
    </section>
  )
}