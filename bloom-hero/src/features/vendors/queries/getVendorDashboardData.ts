"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess";
import { normalizeBusinessType } from "@/features/vendors/utils/normalizeBusinessType";
import type {
  VendorDashboardKPIItem,
  VendorDashboardLowStockProduct,
  VendorDashboardRecentOrder,
  VendorDashboardTrendPoint,
  VendorDashboardUpcomingOrder,
} from "@/features/vendors/types/dashboard";

export type VendorDashboardData = {
  kpis: VendorDashboardKPIItem[];
  recentOrders: VendorDashboardRecentOrder[];
  lowStock: VendorDashboardLowStockProduct[];
  upcomingOrders: VendorDashboardUpcomingOrder[];
  revenueTrend: VendorDashboardTrendPoint[];
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

function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function getVendorDashboardData(): Promise<
  { ok: true; data: VendorDashboardData } | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, error: "Please sign in to view vendor insights." };

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("id, business_type")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string; business_type: "registered" | "unregistered" }>();

  if (vendorError || !vendor) return { ok: false, error: "Vendor profile not found." };
  const businessType = normalizeBusinessType(vendor.business_type) ?? "unregistered";
  if (!canManageCatalog(businessType)) {
    return { ok: false, error: "Order insights are available for registered businesses only." };
  }

  const routePrefix = "/vendor";
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
    .neq("status", "cancelled")
    .neq("status", "pending");

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
  const trendPoints: VendorDashboardTrendPoint[] = Array.from({ length: 7 }).map((_, index) => {
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

  const lowStockProducts: VendorDashboardLowStockProduct[] = (lowStockRows ?? []).map((row) => ({
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

  const statusMap = (status: string): VendorDashboardRecentOrder["status"] => {
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    return "Pending";
  };

  const recentOrdersList: VendorDashboardRecentOrder[] = recentOrdersData.map((entry) => {
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
    };
  });

  const upcomingStart = today;
  const upcomingEnd = addDays(today, 5);
  const { data: upcomingRows } = await supabase
    .from("orders")
    .select("order_date, status")
    .eq("vendor_id", vendor.id)
    .gte("order_date", upcomingStart.toISOString())
    .lt("order_date", upcomingEnd.toISOString())
    .neq("status", "cancelled")
    .neq("status", "pending");

  const upcomingMap = new Map<string, number>();
  for (const row of upcomingRows ?? []) {
    const key = toDateKey(new Date(row.order_date));
    upcomingMap.set(key, (upcomingMap.get(key) ?? 0) + 1);
  }

  const upcomingOrders: VendorDashboardUpcomingOrder[] = Array.from({ length: 5 }).map((_, index) => {
    const day = addDays(today, index);
    const key = toDateKey(day);
    return {
      date: String(day.getDate()).padStart(2, "0"),
      day: day.toLocaleDateString("en-PH", { weekday: "short" }),
      count: upcomingMap.get(key) ?? 0,
      isToday: index === 0,
    };
  });

  const kpis: VendorDashboardKPIItem[] = [
    {
      label: "Orders",
      value: currentOrderCount.toString(),
      change:
        ordersChangePct === null
          ? "—"
          : `${ordersChangePct >= 0 ? "+" : ""}${ordersChangePct.toFixed(1)}%`,
      positive: ordersChangePct === null ? true : ordersChangePct >= 0,
      icon: "mdi:shopping-outline",
      href: `${routePrefix}/orders`,
    },
    {
      label: "Revenue",
      value: formatCurrency(currentRevenue),
      change:
        revenueChangePct === null
          ? "—"
          : `${revenueChangePct >= 0 ? "+" : ""}${revenueChangePct.toFixed(1)}%`,
      positive: revenueChangePct === null ? true : revenueChangePct >= 0,
      icon: "mdi:cash-multiple",
      href: `${routePrefix}/orders`,
    },
    {
      label: "Pending",
      value: pendingFulfilment.toString(),
      change: "",
      positive: false,
      icon: "mdi:clock-alert-outline",
      href: `${routePrefix}/orders`,
    },
    {
      label: "Low stock",
      value: lowStockProducts.length.toString(),
      change: "",
      positive: false,
      icon: "mdi:package-variant-closed",
      href: `${routePrefix}/products`,
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
