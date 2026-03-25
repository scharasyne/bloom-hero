"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { VendorDashboardSidebarCard } from "@/app/vendor/_components/vendor-dashboard-sidebar-card";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatCard {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  orderId: string;
  date: string;
  amount: string;
  status: "Pending" | "Completed" | "Cancelled";
}

interface CalendarDay {
  day: number;
  dayName: string;
  orders: number;
  isToday?: boolean;
}

// ─── Mock data — swap each const for a DB/API call later ─────────────────────
const STAT_CARDS: StatCard[] = [
  { icon: "mdi:currency-php",           iconColor: "#2f5d3a", value: "₱12,345", label: "Total Revenue",   trend: "+12.3%", trendUp: true },
  { icon: "mdi:cart-outline",           iconColor: "#d24b46", value: "123",     label: "Total Orders",    trend: "+4.2%",  trendUp: true },
  { icon: "mdi:package-variant-closed", iconColor: "#4a90d9", value: "12",      label: "Products Listed" },
  { icon: "mdi:clock-outline",          iconColor: "#e8a838", value: "6",       label: "Pending Orders"  },
];

const RECENT_ORDERS: Order[] = [
  { id: "1", customer: "Juan Dela Cruz", product: "Red Rose Bouquet", orderId: "Order #1234", date: "2026-02-08 at 2:00 PM", amount: "₱1,200", status: "Pending"   },
  { id: "2", customer: "Juan Dela Cruz", product: "Red Rose Bouquet", orderId: "Order #1234", date: "2026-02-08 at 2:00 PM", amount: "₱1,200", status: "Completed" },
  { id: "3", customer: "Juan Dela Cruz", product: "Red Rose Bouquet", orderId: "Order #1234", date: "2026-02-08 at 2:00 PM", amount: "₱1,200", status: "Cancelled" },
  { id: "4", customer: "Juan Dela Cruz", product: "Red Rose Bouquet", orderId: "Order #1234", date: "2026-02-08 at 2:00 PM", amount: "₱1,200", status: "Pending"   },
];

const CALENDAR_DAYS: CalendarDay[] = [
  { day: 8,  dayName: "Sun", orders: 3, isToday: true },
  { day: 9,  dayName: "Mon", orders: 2 },
  { day: 10, dayName: "Tue", orders: 6 },
  { day: 11, dayName: "Wed", orders: 1 },
  { day: 12, dayName: "Thu", orders: 2 },
  { day: 13, dayName: "Fri", orders: 5 },
  { day: 14, dayName: "Sat", orders: 3 },
];

const CHART_POINTS = [
  { label: "Jan",   value: 340 },
  { label: "Feb",   value: 430 },
  { label: "March", value: 610 },
];

const CHART_RANGES = ["Last 3 months", "Last 6 months", "This year"];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order["status"] }) {
  const styles: Record<Order["status"], string> = {
    Pending:   "bg-[#fff3cd] text-[#856404]",
    Completed: "bg-[#d1e7dd] text-[#0a5c36]",
    Cancelled: "bg-[#f8d7da] text-[#842029]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.4px] ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── Sales chart (pure SVG) ───────────────────────────────────────────────────
function SalesChart() {
  const [range, setRange] = useState("Last 3 months");
  const [open, setOpen] = useState(false);

  const W = 600; const H = 220;
  const padL = 48; const padR = 24; const padT = 16; const padB = 36;
  const minVal = 200; const maxVal = 700;

  const pts = CHART_POINTS.map((p, i) => ({
    x: padL + (i / (CHART_POINTS.length - 1)) * (W - padL - padR),
    y: padT + (1 - (p.value - minVal) / (maxVal - minVal)) * (H - padT - padB),
    label: p.label,
  }));

  const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H - padB} L ${pts[0].x} ${H - padB} Z`;
  const gridVals = [300, 400, 500, 600, 700];

  return (
    <div className="rounded-[14px] border border-[#edeae6] bg-white p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-[#1f1f1f] text-[15px]">Sales Overview</p>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 border border-[#edeae6] rounded-[8px] px-3 py-1.5 text-[12px] font-medium text-[#4f4f4f] hover:bg-[#f5f1ec] transition-colors"
          >
            {range}
            <Icon icon="mdi:chevron-down" width={14} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[#edeae6] rounded-[10px] shadow-md z-10 overflow-hidden min-w-[140px]">
              {CHART_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRange(r); setOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-[12px] hover:bg-[#f5f1ec] transition-colors ${r === range ? "font-semibold text-[#2f5d3a]" : "font-medium text-[#4f4f4f]"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
        {gridVals.map((v) => {
          const y = padT + (1 - (v - minVal) / (maxVal - minVal)) * (H - padT - padB);
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#edeae6" strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#aaa">{v}</text>
            </g>
          );
        })}
        <path d={areaD} fill="#b2d8c4" fillOpacity={0.25} />
        <path d={pathD} fill="none" stroke="#6aab85" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#6aab85" strokeWidth={2} />
            <text x={p.x} y={H - padB + 16} textAnchor="middle" fontSize={11} fill="#888">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VendorMarketDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">

        <VendorDashboardSidebarCard activeTab="dashboard" vendorType="market" />

        <div className="flex flex-col gap-6">

          {/* Header */}
          <div>
            <h1 className="font-bold text-[#1f1f1f] text-[26px] tracking-[-0.26px] leading-tight">
              Dashboard
            </h1>
            <p className="font-medium text-[#7a7a7a] text-[13px] mt-0.5">
              Here&apos;s what&apos;s happening with your shop.
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="rounded-[14px] border border-[#edeae6] bg-white p-4 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Icon icon={card.icon} width={22} color={card.iconColor} />
                  {card.trend && (
                    <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${card.trendUp ? "text-[#2f5d3a]" : "text-[#d24b46]"}`}>
                      <Icon icon={card.trendUp ? "mdi:trending-up" : "mdi:trending-down"} width={13} />
                      {card.trend}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#1f1f1f] text-[22px] tracking-[-0.4px] leading-tight">{card.value}</p>
                  <p className="font-medium text-[#7a7a7a] text-[12px] mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Sales chart + Upcoming orders ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
            <SalesChart />

            <div className="rounded-[14px] border border-[#edeae6] bg-white p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#1f1f1f] text-[15px]">Upcoming Orders</p>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f5f1ec] transition-colors">
                    <Icon icon="mdi:chevron-left" width={16} color="#7a7a7a" />
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f5f1ec] transition-colors">
                    <Icon icon="mdi:chevron-right" width={16} color="#7a7a7a" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-[#7a7a7a] text-[12px] text-center -mt-1">February 2026</p>
              <div className="flex flex-col gap-1.5">
                {CALENDAR_DAYS.map((day) => (
                  <div key={day.day} className={`flex items-center gap-3 px-3 py-2 rounded-[10px] transition-colors ${day.isToday ? "bg-[#fde8e7]" : "hover:bg-[#f5f1ec]"}`}>
                    <div className="w-10 flex-shrink-0">
                      <p className={`font-bold text-[15px] leading-tight ${day.isToday ? "text-[#d24b46]" : "text-[#1f1f1f]"}`}>{day.day}</p>
                      <p className="font-medium text-[#aaa] text-[10px]">{day.dayName}</p>
                    </div>
                    <p className="flex-1 font-medium text-[#4f4f4f] text-[13px]">
                      {day.orders} {day.orders === 1 ? "order" : "orders"}
                    </p>
                    <Icon icon="mdi:calendar-blank-outline" width={16} color="#ccc" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent orders ── */}
          <div className="rounded-[14px] border border-[#edeae6] bg-white p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-[#1f1f1f] text-[15px]">Recent Orders</p>
              <button className="font-medium text-[#2f5d3a] text-[12px] hover:underline">View all</button>
            </div>
            <div className="flex flex-col divide-y divide-[#f0ece8]">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#1f1f1f] text-[13px]">{order.customer}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="font-medium text-[#7a7a7a] text-[12px]">{order.product}</p>
                    <p className="font-medium text-[#aaa] text-[11px]">{order.orderId} • {order.date}</p>
                  </div>
                  <p className="font-bold text-[#1f1f1f] text-[14px] flex-shrink-0">{order.amount}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}