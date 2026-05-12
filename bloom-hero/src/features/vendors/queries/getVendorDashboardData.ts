"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  MarketKPIItem,
  MarketLowStockProduct,
  MarketRecentOrder,
  MarketTrendPoint,
  MarketUpcomingOrder,
} from "@/lib/mockData";

type VendorType = "market" | "pop-up";

export type VendorDashboardData = {
  kpis: MarketKPIItem[];
  recentOrders: MarketRecentOrder[];
  lowStock: MarketLowStockProduct[];
  upcomingOrders: MarketUpcomingOrder[];
  revenueTrend: MarketTrendPoint[];
  revenueSummary: {
    total: number;
    changePct: number | null;
    positive: boolean;
  };
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDayLabel(value: Date) {
  return value.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function formatCurrency(value: number) {
  return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

export async function getVendorDashboardData(
  vendorType: VendorType
): Promise<{ ok: true; data: VendorDashboardData } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, error: "Please sign in to view vendor insights." };

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .eq("vendor_type", vendorType)
    .maybeSingle<{ id: string }>();

  if (vendorError || !vendor) return { ok: false, error: "Vendor profile not found." };

  const routePrefix = vendorType === "market" ? "/market" : "/pop-up";
  const today = startOfDay(new Date());
  const currentStart = addDays(today, -6);
  const currentEnd = addDays(today, 1);
  const previousStart = addDays(currentStart, -7);
  const fulfilmentStatuses = ["to_pay", "to_ship", "to_receive"];

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendor.id)
    .in("status", fulfilmentStatuses);

  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_date, total_amount, status, customer_id")
    .eq("vendor_id", vendor.id)
    .gte("order_date", previousStart.toISOString())
    .lt("order_date", currentEnd.toISOString())
    .neq("status", "cancelled");

  if (ordersError) return { ok: false, error: "Failed to load order metrics." };
  const orders = orderRows ?? [];

  const currentOrders = orders.filter((row) => {
    const when = new Date(row.order_date);
    return when >= currentStart && when < currentEnd;
  });
  const previousOrders = orders.filter((row) => {
    const when = new Date(row.order_date);
    return when >= previousStart && when < currentStart;
  });
  const sumOrders = (rows: typeof orders) =>
    rows.reduce((total, row) => total + Number(row.total_amount || 0), 0);

  const currentRevenue = sumOrders(currentOrders);
  const previousRevenue = sumOrders(previousOrders);
  const revenueChangePct =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : null;

  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;
  const ordersChangePct =
    previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : null;

  const pendingFulfilment = pendingCount ?? 0;
  const trendPoints: MarketTrendPoint[] = Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(currentStart, index);
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    const total = orders
      .filter((row) => {
        const when = new Date(row.order_date);
        return when >= dayStart && when < dayEnd;
      })
      .reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    return { label: formatDayLabel(day), value: total };
  });

  const { data: lowStockRows } = await supabase
    .from("products")
    .select("id, product_name, stocks")
    .eq("vendor_id", vendor.id)
    .lte("stocks", 3)
    .order("stocks", { ascending: true });

  const lowStockProducts: MarketLowStockProduct[] = (lowStockRows ?? []).map((row) => ({
    id: row.id,
    name: row.product_name,
    stock: row.stocks,
  }));

  const { data: recentItemRows } = (await supabase
    .from("order_items")
    .select(
      "order_id, quantity, subtotal, products(product_name), orders!inner(id, customer_id, order_date, status, total_amount)"
    )
    .eq("orders.vendor_id", vendor.id)
    .order("order_date", { ascending: false, foreignTable: "orders" })
    .limit(20)) as {
    data:
      | {
          order_id: string;
          quantity: number;
          subtotal: number;
          products: { product_name: string } | null;
          orders:
            | {
                id: string;
                customer_id: string;
                order_date: string;
                status: string;
                total_amount: number;
              }
            | null;
        }[]
      | null;
  };

  const recentRows = recentItemRows ?? [];
  const groupedRecent = new Map<
    string,
    {
      order: NonNullable<(typeof recentRows)[number]["orders"]>;
      itemNames: string[];
    }
  >();

  for (const row of recentRows) {
    if (!row.orders) continue;
    if (!groupedRecent.has(row.order_id)) {
      groupedRecent.set(row.order_id, { order: row.orders, itemNames: [] });
    }
    if (row.products?.product_name) {
      groupedRecent.get(row.order_id)!.itemNames.push(row.products.product_name);
    }
  }

  const recentOrdersData = Array.from(groupedRecent.values())
    .sort((a, b) => new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime())
    .slice(0, 5);

  const customerIds = Array.from(new Set(recentOrdersData.map((entry) => entry.order.customer_id)));
  const { data: customerRows } = customerIds.length
    ? await supabase.from("users").select("id, name, email").in("id", customerIds)
    : { data: [] };

  const customerNameMap = new Map(
    (customerRows ?? []).map((row) => [row.id, row.name || row.email || "Customer"])
  );

  const statusMap = (status: string): MarketRecentOrder["status"] => {
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    return "Pending";
  };

  const recentOrdersList: MarketRecentOrder[] = recentOrdersData.map((entry) => {
    const firstItem = entry.itemNames[0] ?? "Order";
    const extraCount = Math.max(entry.itemNames.length - 1, 0);
    const itemLabel = extraCount > 0 ? `${firstItem} +${extraCount} more` : firstItem;
    return {
      id: entry.order.id,
      customerName: customerNameMap.get(entry.order.customer_id) ?? "Customer",
      item: itemLabel,
      status: statusMap(entry.order.status),
      amount: formatCurrency(Number(entry.order.total_amount || 0)),
      date: new Date(entry.order.order_date).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      href: `${routePrefix}/orders/${entry.order.id}`,
    };
  });

  const upcomingOrders: MarketUpcomingOrder[] = recentOrdersList
    .map((entry) => ({
      id: entry.id,
      customerName: entry.customerName,
      item: entry.item,
      amount: entry.amount,
      date: entry.date,
      href: entry.href,
    }))
    .slice(0, 3);

  const kpis: MarketKPIItem[] = [
    {
      label: "Orders",
      value: currentOrderCount,
      change: ordersChangePct,
      positive: (ordersChangePct ?? 0) >= 0,
    },
    {
      label: "Revenue",
      value: currentRevenue,
      change: revenueChangePct,
      positive: (revenueChangePct ?? 0) >= 0,
    },
    {
      label: "Pending",
      value: pendingFulfilment,
      change: null,
      positive: true,
    },
    {
      label: "Low stock",
      value: lowStockProducts.length,
      change: null,
      positive: false,
    },
  ];

  return {
    ok: true,
    data: {
      kpis,
      recentOrders: recentOrdersList,
      lowStock: lowStockProducts,
      upcomingOrders,
      revenueTrend: trendPoints,
      revenueSummary: {
        total: currentRevenue,
        changePct: revenueChangePct,
        positive: (revenueChangePct ?? 0) >= 0,
      },
    },
  };
}
