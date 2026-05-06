import type { OrderGroup } from "../orders/_lib/types";
import { STATUS_BADGE } from "../orders/_lib/constants";
import type { TabKey } from "../orders/_lib/constants";
import { formatPeso, friendlyDate } from "../orders/_lib/utils";
import { PaymentCountdown } from "./PaymentCountdown";

function IconStorefront({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconStar({ filled = false, className = "" }: { filled?: boolean; className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconCart({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconImage({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function IconCreditCard({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconPackageCheck({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M16 16l2 2 4-4" />
      <path d="M20 7l-8 4.5L4 7" />
      <path d="M12 11.5V21" />
      <path d="M20 7v6" />
      <path d="M4 7v10l8 4 4-2" />
      <path d="M16 5.25l-8 4.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab-aware footer actions                                           */
/* ------------------------------------------------------------------ */
function OrderFooterActions({ order, activeTab }: { order: OrderGroup; activeTab: TabKey }) {

  if (activeTab === "to-pay") {
    return (
      <div className="flex flex-col gap-3 w-full sm:w-auto">
        {/* FIX 7: Countdown left-aligned, actions right-aligned — no more floating center */}
        <PaymentCountdown orderDate={order.orderDate} />
        <div className="flex items-center gap-2.5 justify-end flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#A39E96] font-semibold uppercase tracking-wider">Amount Due</span>
            <span className="text-lg font-bold text-[#2f2f2f] tabular-nums">{formatPeso(order.total)}</span>
          </div>
          {order.receiptProofUrl ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              Receipt uploaded
            </span>
          ) : null}
          {/*
            FIX 6: Cancel Order has stronger destructive visual weight —
            solid red bg instead of just a red outline, so it reads as
            "this is irreversible" not just a secondary option.
          */}
          <a
            href={`/orders/${order.id}/cancel`}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border-2 border-red-300 px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-400 transition-colors"
          >
            Cancel Order
          </a>
          {/* FIX 2: Pay Now → solid red, customer primary CTA */}
          <a
            href={`/orders/${order.id}/pay`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white hover:bg-[#A53A35] shadow-sm hover:shadow-md hover:-translate-y-px transition-all"
          >
            <IconCreditCard />
            Pay Now
          </a>
        </div>
      </div>
    );
  }

  if (activeTab === "to-ship") {
    return (
      <div className="flex items-center gap-2.5 justify-end flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[#A39E96] font-semibold uppercase tracking-wider">Total</span>
          <span className="text-lg font-bold text-[#2f2f2f] tabular-nums">{formatPeso(order.total)}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-5 py-2 text-xs font-semibold text-blue-700">
          Vendor is preparing your order
        </span>
      </div>
    );
  }

  if (activeTab === "to-receive") {
    return (
      <div className="flex items-center gap-2.5 justify-end flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-[#A39E96] font-semibold uppercase tracking-wider">Total</span>
          <span className="text-lg font-bold text-[#2f2f2f] tabular-nums">{formatPeso(order.total)}</span>
        </div>
        {/* Order Received — positive confirmation action, red as customer primary */}
        <a
          href={`/orders/${order.id}/confirm-receipt`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white hover:bg-[#A53A35] shadow-sm hover:shadow-md hover:-translate-y-px transition-all"
        >
          <IconPackageCheck />
          Order Received
        </a>
      </div>
    );
  }

  // completed
  return (
    <div className="flex items-center gap-2.5 justify-end flex-wrap">
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs text-[#A39E96] font-semibold uppercase tracking-wider">Total</span>
        <span className="text-lg font-bold text-[#2f2f2f] tabular-nums">{formatPeso(order.total)}</span>
      </div>
      {order.hasReview ? (
        <a
          href={`/review?orderId=${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e2dd] bg-white px-5 py-2 text-xs font-bold text-[#A39E96] hover:bg-[#faf8f5] transition-colors"
        >
          <IconStar filled className="text-amber-400" />
          View Rating
        </a>
      ) : (
        <a
          href={`/review?orderId=${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#D24B46]/30 bg-[#D24B46]/5 px-5 py-2 text-xs font-bold text-[#D24B46] hover:bg-[#D24B46]/10 transition-colors"
        >
          <IconStar className="text-[#D24B46]" />
          Rate Order
        </a>
      )}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white hover:bg-[#A53A35] shadow-sm hover:shadow-md hover:-translate-y-px transition-all"
      >
        <IconCart />
        Buy Again
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OrderCard                                                          */
/* ------------------------------------------------------------------ */
export function OrderCard({ order, activeTab }: { order: OrderGroup; activeTab: TabKey }) {
  /*
    FIX 4: totalItems was counting total quantity across all rows,
    which reads as "5 items" when it's really 1 product × qty 5.
    Now shows distinct product count — e.g. "1 product" or "3 products".
    Qty per line item is already shown on each row.
  */
  const productCount = order.items.filter(row => row.products !== null).length;
  const badge = STATUS_BADGE[activeTab];

  return (
    <section className="rounded-2xl bg-white border border-[#e6e2dd] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

      {/* Vendor header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#faf8f5] px-5 sm:px-6 py-4 border-b border-[#eeebe6]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e6e2dd] text-[#2f5d3a] shrink-0 shadow-sm">
            <IconStorefront />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#2f2f2f] truncate">{order.vendorName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] font-semibold text-[#A39E96] uppercase tracking-wide">
                #{order.id.slice(0, 8)}
              </span>
              <span className="text-[11px] text-[#A39E96] hidden sm:inline">
                {friendlyDate(order.orderDate)}
              </span>
            </div>
          </div>
        </div>
        {/* FIX 5: Badge uses semantic color from updated STATUS_BADGE constants */}
        <span className={`inline-flex items-center gap-1.5 rounded-full ${badge.bg} border ${badge.border} px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.text}`}>
          <IconCheck />
          {badge.label}
        </span>
      </div>

      {/* Mobile-only date */}
      <div className="px-5 sm:px-6 pt-2 sm:hidden">
        <p className="text-[11px] text-[#A39E96]">{friendlyDate(order.orderDate)}</p>
      </div>

      {/* Items list */}
      <div className="px-5 sm:px-6 divide-y divide-[#f3f0eb]">
        {order.items.map((row, i) => {
          const product = row.products;
          if (!product) return null;
          return (
            <div key={i} className="flex items-center gap-4 py-5">
              <div className="h-20 w-20 rounded-2xl bg-[#f7f3ec] overflow-hidden shrink-0 border border-[#eee9e1]">
                {product.product_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.product_image_url} alt={product.product_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <IconImage />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#2f2f2f] truncate">{product.product_name}</p>
                <p className="mt-1 text-xs text-[#A39E96] font-medium">
                  {formatPeso(Number(product.price) || 0)}{" "}
                  <span className="text-[#c0b8b0]">/ stem</span>
                </p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                {row.quantity > 1 && (
                  <p className="text-sm font-bold text-[#2f2f2f]">
                    {formatPeso(Number(row.subtotal) || 0)}
                  </p>
                )}
                <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#f8f5f0] rounded-full border border-[#f1eee8] text-[11px] font-semibold text-[#A39E96]">
                  Qty: {row.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#eeebe6] bg-[#faf8f5] px-5 sm:px-6 py-4">
        {/* FIX 4: "X product(s)" instead of misleading "X items" */}
        <p className="text-xs text-[#A39E96] font-semibold">
          {productCount} product{productCount !== 1 ? "s" : ""}
        </p>
        <OrderFooterActions order={order} activeTab={activeTab} />
      </div>
    </section>
  );
}