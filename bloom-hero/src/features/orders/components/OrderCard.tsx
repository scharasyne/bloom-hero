import { confirmCustomerCodOrder } from "@/features/orders/actions/confirmCustomerCodOrder";
import type { OrderGroup, OrderItemRow } from "@/features/orders/types";
import { STATUS_BADGE } from "@/features/orders/constants";
import type { TabKey } from "@/features/orders/constants";
import { formatPeso, friendlyDate } from "@/features/orders/utils";
import { PaymentCountdown } from "@/features/orders/components/PaymentCountdown";

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

function ItemTotalLabel({
  lineTotal,
  orderTotal,
  orderItemCount,
  label = "Item Total",
}: {
  lineTotal: number;
  orderTotal: number;
  orderItemCount: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A39E96]">{label}</span>
        <span className="text-lg font-bold tabular-nums text-[#2f2f2f]">{formatPeso(lineTotal)}</span>
      </div>
      {orderItemCount > 1 ? (
        <span className="text-[11px] text-[#A39E96]">
          Order total {formatPeso(orderTotal)}
          {label === "Item Total" ? " incl. delivery" : ""}
        </span>
      ) : null}
    </div>
  );
}

function OrderFooterActions({
  order,
  activeTab,
  lineTotal,
  orderItemCount,
}: {
  order: OrderGroup;
  activeTab: TabKey;
  lineTotal: number;
  orderItemCount: number;
}) {
  const hasReceipt = Boolean(order.receiptProofUrl);
  const isCod = order.paymentMethod === "cod";

  if (activeTab === "to-pay") {
    return (
      <div className="flex w-full flex-col gap-3 sm:w-auto">
        {!isCod && !hasReceipt ? <PaymentCountdown orderDate={order.orderDate} /> : null}
        {isCod ? (
          <p className="text-xs font-medium text-[#6D6863]">
            Cash on delivery — confirm to send this order to the vendor.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <ItemTotalLabel
            lineTotal={lineTotal}
            orderTotal={order.total}
            orderItemCount={orderItemCount}
          />
          {!isCod && hasReceipt ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              Receipt uploaded
            </span>
          ) : null}
          {hasReceipt && !isCod ? (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border-2 border-[#e6e2dd] bg-[#f6f3ef] px-5 py-2 text-xs font-bold text-[#b4ada5]"
            >
              Cancel Order
            </span>
          ) : (
            <a
              href={`/orders/${order.id}/cancel`}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-300 bg-red-50 px-5 py-2 text-xs font-bold text-red-600 transition-colors hover:border-red-400 hover:bg-red-100"
            >
              Cancel Order
            </a>
          )}
          {isCod ? (
            <form action={confirmCustomerCodOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#A53A35] hover:shadow-md"
              >
                Confirm Order
              </button>
            </form>
          ) : (
            <a
              href={`/orders/${order.id}/pay`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#A53A35] hover:shadow-md"
            >
              <IconCreditCard />
              Pay Now
            </a>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "to-ship") {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <ItemTotalLabel lineTotal={lineTotal} orderTotal={order.total} orderItemCount={orderItemCount} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-xs font-semibold text-blue-700">
          Awaiting vendor confirmation
        </span>
      </div>
    );
  }

  if (activeTab === "to-receive") {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <ItemTotalLabel lineTotal={lineTotal} orderTotal={order.total} orderItemCount={orderItemCount} />
        <a
          href={`/orders/${order.id}/confirm-receipt`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#A53A35] hover:shadow-md"
        >
          <IconPackageCheck />
          Order Received
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      <ItemTotalLabel lineTotal={lineTotal} orderTotal={order.total} orderItemCount={orderItemCount} />
      {order.hasReview ? (
        <a
          href={`/review?orderId=${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e2dd] bg-white px-5 py-2 text-xs font-bold text-[#A39E96] transition-colors hover:bg-[#faf8f5]"
        >
          <IconStar filled className="text-amber-400" />
          View Rating
        </a>
      ) : (
        <a
          href={`/review?orderId=${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#D24B46]/30 bg-[#D24B46]/5 px-5 py-2 text-xs font-bold text-[#D24B46] transition-colors hover:bg-[#D24B46]/10"
        >
          <IconStar className="text-[#D24B46]" />
          Rate Order
        </a>
      )}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#D24B46] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#A53A35] hover:shadow-md"
      >
        <IconCart />
        Buy Again
      </a>
    </div>
  );
}

type OrderCardProps = {
  order: OrderGroup;
  item: OrderItemRow;
  activeTab: TabKey;
};

export function OrderCard({ order, item, activeTab }: OrderCardProps) {
  const product = item.products;
  const productName = product?.product_name ?? "Product unavailable";
  const unitPrice = Number(product?.price) || 0;

  const orderItemCount = order.items.length;
  const lineTotal = Number(item.subtotal) || 0;
  const badge =
    activeTab === "to-pay" && order.receiptProofUrl
      ? { ...STATUS_BADGE[activeTab], label: "Pending Confirmation" }
      : activeTab === "to-ship" && order.status === "confirmed"
        ? { ...STATUS_BADGE[activeTab], label: "Confirmed" }
        : STATUS_BADGE[activeTab];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e6e2dd] bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeebe6] bg-[#faf8f5] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A39E96]">
              #{order.id.slice(0, 8)}
            </span>
            <span className="text-[11px] text-[#A39E96]">{friendlyDate(order.orderDate)}</span>
          </div>
          {orderItemCount > 1 ? (
            <p className="mt-0.5 text-[11px] text-[#c0b8b0]">
              {orderItemCount} items in this checkout
            </p>
          ) : null}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full ${badge.bg} border ${badge.border} px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.text}`}
        >
          <IconCheck />
          {badge.label}
        </span>
      </div>

      <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#eee9e1] bg-[#f7f3ec]">
          {product?.product_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.product_image_url}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <IconImage />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#2f2f2f]">{productName}</p>
          <p className="mt-1 text-xs font-medium text-[#A39E96]">
            {formatPeso(unitPrice)}{" "}
            <span className="text-[#c0b8b0]">/ stem</span>
          </p>
          <span className="mt-2 inline-flex items-center justify-center rounded-full border border-[#f1eee8] bg-[#f8f5f0] px-2 py-0.5 text-[11px] font-semibold text-[#A39E96]">
            x{item.quantity}
          </span>
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-[#2f2f2f]">{formatPeso(lineTotal)}</p>
      </div>

      <div className="border-t border-[#eeebe6] bg-[#faf8f5] px-4 py-3 sm:px-5">
        <OrderFooterActions
          order={order}
          activeTab={activeTab}
          lineTotal={lineTotal}
          orderItemCount={orderItemCount}
        />
      </div>
    </section>
  );
}
