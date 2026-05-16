// Source: `src/app/(vendor)/_components/vendor-orders-status-pill.tsx`


export type VendorOrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled"

const STATUS_STYLES: Record<
  VendorOrderStatus,
  { dot: string; bg: string; text: string }
> = {
  Pending: {
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
  },
  Preparing: {
    dot: "bg-sky-400",
    bg: "bg-sky-50",
    text: "text-sky-800",
  },
  Ready: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
  },
  Completed: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
  },
  Cancelled: {
    dot: "bg-[#e9c0af]",
    bg: "bg-[#f7ebe6]",
    text: "text-[#825b4a]",
  },
}

export function VendorOrdersStatusPill({ status }: { status: VendorOrderStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}