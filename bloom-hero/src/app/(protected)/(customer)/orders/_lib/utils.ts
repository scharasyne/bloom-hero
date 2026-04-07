// Cut formatPeso, friendlyDate, and the groupOrders logic from page.tsx

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

import type { OrderItemRow, OrderGroup } from "./types";

// Cut from inside page.tsx — the for loop that builds ordersMap
export function groupOrders(rows: OrderItemRow[]): OrderGroup[] {
  const ordersMap = new Map<string, OrderGroup>();

  for (const row of rows) {
    if (!row.orders) continue;
    const key = row.orders.id;
    if (!ordersMap.has(key)) {
      ordersMap.set(key, {
        id: row.order_id,
        vendorId: row.orders.vendors?.id ?? null,
        vendorName: row.orders.vendors?.shop_name ?? "Bloom & Co.",
        status: row.orders.status,
        orderDate: row.orders.order_date,
        total: Number(row.orders.total_amount) || 0,
        items: [],
        hasReview: false,
      });
    }
    ordersMap.get(key)!.items.push(row);
  }

  return Array.from(ordersMap.values());
}