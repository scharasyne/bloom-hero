// Source: `src/app/(customer)/orders/_lib/utils.ts`

import type {
  OrderItemRow,
  OrderGroup,
  OrderItemCardModel,
  VendorOrderSection,
} from "@/features/orders/types";

export function formatPeso(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export function friendlyDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  const time = d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function paymentCountdown(orderDate: string): { label: string; expired: boolean } {
  const deadline = new Date(new Date(orderDate).getTime() + 24 * 60 * 60 * 1000);
  const msLeft = deadline.getTime() - Date.now();
  if (msLeft <= 0) return { label: "Payment window expired", expired: true };
  const h = Math.floor(msLeft / 3_600_000);
  const m = Math.floor((msLeft % 3_600_000) / 60_000);
  return { label: `Pay within ${h}h ${m}m or order will be cancelled`, expired: false };
}

export function groupOrders(rows: OrderItemRow[]): OrderGroup[] {
  const ordersMap = new Map<string, OrderGroup>();

  for (const row of rows) {
    if (!row.orders) continue;
    const key = row.orders.id;
    if (!ordersMap.has(key)) {
      ordersMap.set(key, {
        id: row.orders.id,
        vendorId: row.orders.vendors?.id ?? row.orders.vendor_id ?? null,
        vendorName: row.orders.vendors?.shop_name ?? "Shop",
        status: row.orders.status,
        paymentMethod: row.orders.payment_method ?? null,
        orderDate: row.orders.order_date,
        total: Number(row.orders.total_amount) || 0,
        receiptProofUrl: row.orders.receipt_proof_url,
        receiptSubmittedAt: row.orders.receipt_submitted_at,
        items: [],
        hasReview: false,
      });
    }
    ordersMap.get(key)!.items.push(row);
  }

  return Array.from(ordersMap.values());
}

export function groupOrderItemsByVendor(orders: OrderGroup[]): VendorOrderSection[] {
  const sections = new Map<string, VendorOrderSection>();

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  for (const order of sortedOrders) {
    const key = order.vendorId ?? order.vendorName;
    if (!sections.has(key)) {
      sections.set(key, {
        vendorId: order.vendorId,
        vendorName: order.vendorName,
        cards: [],
      });
    }

    for (const row of order.items) {
      sections.get(key)!.cards.push({
        itemId: row.id,
        row,
        order,
      });
    }
  }

  return Array.from(sections.values());
}
