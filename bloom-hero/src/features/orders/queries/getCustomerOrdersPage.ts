// Source: `src/app/(customer)/orders/page.tsx`

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { TAB_STATUS_MAP, type TabKey } from "@/features/orders/constants";
import type { CustomerOrdersPageResult, OrderItemRow } from "@/features/orders/types";
import { groupOrders } from "@/features/orders/utils";

export async function getCustomerOrdersPage(  tab: string | undefined
): Promise<CustomerOrdersPageResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authenticated: false };
  }

  const validTabs: TabKey[] = ["to-pay", "to-ship", "to-receive", "completed"];
  const rawTab = tab ?? "to-pay";
  const normalizedTab =
    rawTab === "to_pay"
      ? "to-pay"
      : rawTab === "to_ship"
        ? "to-ship"
        : rawTab === "to_receive"
          ? "to-receive"
          : rawTab;
  const activeTab: TabKey = validTabs.includes(normalizedTab as TabKey)
    ? (normalizedTab as TabKey)
    : "to-pay";
  const activeStatuses = TAB_STATUS_MAP[activeTab];

  const { data: rows } = (await supabase
    .from("order_items")
    .select(
      "id, order_id, quantity, subtotal, products(id, product_name, price, product_image_url), orders!inner(id, vendor_id, order_date, status, payment_method, total_amount, receipt_proof_url, receipt_submitted_at, vendors(id, shop_name))"
    )
    .eq("orders.customer_id", user.id)
    .in("orders.status", activeStatuses)) as { data: OrderItemRow[] | null };

  const ordersArray = groupOrders(rows ?? []);

  let reviewedOrders = new Set<string>();
  if (activeTab === "completed") {
    const orderIds = ordersArray.map((o) => o.id).filter(Boolean) as string[];
    if (orderIds.length > 0) {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("order_id")
        .eq("customer_id", user.id)
        .in("order_id", orderIds);
      reviewedOrders = new Set((reviews ?? []).map((r: any) => r.order_id));
    }
  }

  const orders = ordersArray
    .map((o) => ({ ...o, hasReview: o.id ? reviewedOrders.has(o.id) : false }))
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return { authenticated: true, activeTab, orders };
}
