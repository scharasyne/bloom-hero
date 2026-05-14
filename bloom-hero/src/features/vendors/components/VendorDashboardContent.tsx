// Source: src/app/(vendor)/_components/VendorMarketDashboardContent.tsx

"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  MarketKPIItem,
  MarketLowStockProduct,
  MarketRecentOrder,
  MarketTrendPoint,
  MarketUpcomingOrder,
} from "@/lib/mockData";

// ─── Sparkline ────────────────────────────────────────────────────────────────

function SparkLine({ data }: { data: number[] }) {
  const W = 320; const H = 56;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * (H - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");
  const lastX = W;
  const lastY = H - ((data[data.length - 1] - min) / (max - min || 1)) * (H - 10) - 5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f5d3a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2f5d3a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#sg)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#2f5d3a"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="3.5" fill="#2f5d3a" />
    </svg>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: MarketRecentOrder["status"] }) {
  const map: Record<MarketRecentOrder["status"], { dot: string; text: string; bg: string }> = {
    Pending:   { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
    Completed: { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
    Cancelled: { dot: "bg-rose-400",    text: "text-rose-600",    bg: "bg-rose-50"    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel = "View all" }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-medium text-[#2f5d3a] opacity-70 transition-opacity hover:opacity-100"
      >
        {linkLabel}
        <Icon icon="mdi:arrow-right" width={12} />
      </Link>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px w-full bg-[#f0ece8]" />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function VendorMarketDashboardContent() {
  return <VendorDashboardContent />;
}

export function VendorDashboardContent() {
  const [kpis, setKpis] = useState<MarketKPIItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<MarketRecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<MarketLowStockProduct[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<MarketUpcomingOrder[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<MarketTrendPoint[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<{
    total: number;
    changePct: number | null;
    positive: boolean;
  }>({ total: 0, changePct: null, positive: true });
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoadError(null);
      const response = await fetch("/api/vendor-dashboard");
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: {
          kpis: MarketKPIItem[];
          recentOrders: MarketRecentOrder[];
          lowStock: MarketLowStockProduct[];
          upcomingOrders: MarketUpcomingOrder[];
          revenueTrend: MarketTrendPoint[];
          revenueSummary: { total: number; changePct: number | null; positive: boolean };
        };
      };

      if (!response.ok || !result.ok || !result.data) {
        if (active) setLoadError(result.error ?? "Failed to load dashboard.");
        return;
      }

      if (!active) return;
      setKpis(result.data.kpis);
      setRecentOrders(result.data.recentOrders);
      setLowStock(result.data.lowStock);
      setUpcomingOrders(result.data.upcomingOrders);
      setRevenueTrend(result.data.revenueTrend);
      setRevenueSummary(result.data.revenueSummary);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const routePrefix = "/vendor";

  const trendValues = revenueTrend.map((d) => d.value);
  const trendFirst = revenueTrend[0]?.label ?? "";
  const trendLast = revenueTrend[revenueTrend.length - 1]?.label ?? "";

  return (
    <div
      className="w-full space-y-6"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-white px-5 py-4 text-sm text-amber-700">
          {loadError}
        </div>
      ) : null}
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group relative overflow-hidden rounded-2xl border border-[#ebe7e3] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(47,93,58,0.10)]"
          >
            {/* subtle top-left accent line */}
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl bg-transparent transition-colors duration-200 group-hover:bg-[#2f5d3a]/20" />

            <div className="mb-4 flex items-start justify-between">
              <Icon icon={kpi.icon} width={18} height={18} className="text-[#2f5d3a]/60" />
              {kpi.change ? (
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    kpi.change === "—" ? "text-slate-400" : kpi.positive ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {kpi.change === "—" ? "—" : `${kpi.positive ? "↑" : "↓"} ${kpi.change}`}
                </span>
              ) : null}
            </div>
            <p className="text-[26px] font-bold leading-none tracking-tight text-[#1e1c1a]">{kpi.value}</p>
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">{kpi.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Revenue Trend */}
        <div className="rounded-2xl border border-[#ebe7e3] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Revenue</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-[#1e1c1a]">
                ₱{revenueSummary.total.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Last 7 days</p>
            </div>
            {revenueSummary.changePct !== null ? (
              <div
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                  revenueSummary.positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <Icon icon={revenueSummary.positive ? "mdi:trending-up" : "mdi:trending-down"} width={13} />
                {`${revenueSummary.changePct >= 0 ? "+" : ""}${revenueSummary.changePct.toFixed(
                  1
                )}% vs prior period`}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
                <Icon icon="mdi:minus" width={13} />
                No prior data
              </div>
            )}
          </div>
          <SparkLine data={trendValues.length ? trendValues : [0, 0, 0, 0, 0, 0, 0]} />
          <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-300">
            <span>{trendFirst}</span>
            <span>{trendLast}</span>
          </div>
        </div>

        {/* Upcoming Orders */}
        <div className="rounded-2xl border border-[#ebe7e3] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <SectionHeader title="Upcoming" href={`${routePrefix}/orders`} linkLabel="All orders" />
          <div className="space-y-1">
            {upcomingOrders.map((o, i) => (
              <div key={o.date}>
                <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${o.isToday ? "bg-[#f4f9f5]" : "hover:bg-[#faf9f7]"}`}>
                  <div className={`flex min-w-[40px] flex-col items-center rounded-lg py-1.5 px-2 text-center ${o.isToday ? "bg-[#2f5d3a] text-white" : "bg-[#f7f5f2] text-[#1e1c1a]"}`}>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${o.isToday ? "text-white/70" : "text-slate-400"}`}>{o.day}</span>
                    <span className="text-sm font-bold leading-none mt-0.5">{o.date}</span>
                  </div>
                  <span className="text-sm text-[#4c4742]">
                    {o.count} {o.count === 1 ? "order" : "orders"}
                  </span>
                  {o.isToday && (
                    <span className="ml-auto text-[10px] font-semibold text-[#2f5d3a]">Today</span>
                  )}
                </div>
                {i < upcomingOrders.length - 1 && (
                  <div className="mx-3 h-px bg-[#f5f2ef]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Recent Orders */}
        <div className="rounded-2xl border border-[#ebe7e3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="px-5 pt-5">
            <SectionHeader title="Recent Orders" href={`${routePrefix}/orders`} />
          </div>
          <div>
            {recentOrders.map((order, i) => (
              <div key={order.id}>
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#faf9f7]">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Avatar initial */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f7f1] text-xs font-bold text-[#2f5d3a]">
                      {order.customerName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1e1c1a]">{order.customerName}</p>
                      <p className="truncate text-xs text-slate-400">{order.item}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusPill status={order.status} />
                    <span className="w-16 text-right text-sm font-bold tabular-nums text-[#1e1c1a]">{order.amount}</span>
                  </div>
                </div>
                {i < recentOrders.length - 1 && <Divider />}
              </div>
            ))}
          </div>
          <div className="border-t border-[#f0ece8] px-5 py-3">
            <Link href={`${routePrefix}/orders`} className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#2f5d3a] opacity-70 transition-opacity hover:opacity-100">
              View all orders <Icon icon="mdi:arrow-right" width={12} />
            </Link>
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl border border-[#ebe7e3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="px-5 pt-5">
            <SectionHeader title="Low Stock" href={`${routePrefix}/products`} linkLabel="Manage" />
          </div>

          {lowStock.length === 0 ? (
            <div className="px-5 pb-5">
              <p className="text-sm text-slate-400">All products are well-stocked.</p>
            </div>
          ) : (
            <div>
              {lowStock.map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#fdf9f6]">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                        <Icon icon="mdi:package-variant-closed" width={14} className="text-orange-400" />
                      </div>
                      <span className="truncate text-sm text-[#2a2724]">{p.name}</span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        p.stock <= 1 ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-500"
                      }`}
                    >
                      {p.stock} left
                    </span>
                  </div>
                  {i < lowStock.length - 1 && <Divider />}
                </div>
              ))}
              <div className="border-t border-[#f0ece8] px-5 py-3">
                <Link
                  href={`${routePrefix}/products`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f0f7f1] py-2.5 text-xs font-semibold text-[#2f5d3a] transition-colors hover:bg-[#e4f0e6]"
                >
                  <Icon icon="mdi:plus" width={13} />
                  Restock products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}