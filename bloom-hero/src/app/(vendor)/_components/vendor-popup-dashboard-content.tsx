"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import {
  mockMostRequested,
  mockRecentRequests,
  mockUpcomingEvents,
} from "@/lib/mockData";

function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
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

function Divider() {
  return <div className="h-px w-full bg-[#f0ece8]" />;
}

const popUpKPIs = [
  {
    label: "Upcoming Events",
    value: `${mockUpcomingEvents.length}`,
    icon: "mdi:calendar-month-outline",
    href: "/pop-up/schedule",
  },
  {
    label: "Active Listings",
    value: "18",
    icon: "mdi:flower-outline",
    href: "/pop-up/products",
  },
  {
    label: "Location Requests",
    value: `${mockRecentRequests.length}`,
    icon: "mdi:map-marker-outline",
    href: "/pop-up/requests",
  },
  {
    label: "Most Requested City",
    value: mockMostRequested[0]?.city ?? "—",
    icon: "mdi:map-search-outline",
    href: "/pop-up/requests",
  },
];

export function VendorPopUpDashboardContent() {
  const nextEvent = mockUpcomingEvents[0];

  return (
    <div className="w-full space-y-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {popUpKPIs.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group relative overflow-hidden rounded-2xl border border-[#ebe7e3] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(47,93,58,0.10)]"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl bg-transparent transition-colors duration-200 group-hover:bg-[#2f5d3a]/20" />
            <div className="mb-4 flex items-start justify-between">
              <Icon icon={kpi.icon} width={18} height={18} className="text-[#2f5d3a]/60" />
            </div>
            <p className="text-[26px] font-bold leading-none tracking-tight text-[#1e1c1a]">
              {kpi.value}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">{kpi.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ebe7e3] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-2">
          <SectionHeader title="Next Event" href="/pop-up/schedule" linkLabel="View schedule" />

          {nextEvent ? (
            <div className="rounded-2xl bg-[#f7faf7] p-5">
              <div className="flex items-start gap-4">
                <div className="flex min-w-[64px] flex-col items-center rounded-2xl bg-[#2f5d3a] px-3 py-3 text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    {nextEvent.date.month}
                  </span>
                  <span className="mt-1 text-2xl font-bold leading-none">
                    {nextEvent.date.day}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-[#1e1c1a]">
                        {nextEvent.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5f655f]">
                        <Icon icon="mdi:map-marker-outline" width={16} />
                        {nextEvent.location}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5f655f]">
                        <Icon icon="mdi:clock-outline" width={16} />
                        {nextEvent.time}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                      {nextEvent.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href="/pop-up/products"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#2f5d3a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#264d2f]"
                    >
                      <Icon icon="mdi:flower-outline" width={16} />
                      Manage listings
                    </Link>
                    <Link
                      href="/pop-up/schedule"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#d9e7db] bg-white px-4 py-2.5 text-sm font-semibold text-[#2f5d3a] transition-colors hover:bg-[#f0f7f1]"
                    >
                      <Icon icon="mdi:calendar-month-outline" width={16} />
                      View schedule
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No upcoming pop-up events yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#ebe7e3] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <SectionHeader title="Top Requests" href="/pop-up/requests" linkLabel="See all" />
          <div>
            {mockMostRequested.map((item, i) => (
              <div key={item.city}>
                <div className="flex items-center justify-between gap-3 px-1 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f7f1] text-xs font-bold text-[#2f5d3a]">
                      #{i + 1}
                    </div>
                    <span className="text-sm font-semibold text-[#1e1c1a]">{item.city}</span>
                  </div>
                  <span className="text-sm font-bold text-[#2f5d3a]">{item.count}</span>
                </div>
                {i < mockMostRequested.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#ebe7e3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="px-5 pt-5">
            <SectionHeader title="Recent Location Requests" href="/pop-up/requests" />
          </div>

          <div>
            {mockRecentRequests.map((request, i) => (
              <div key={`${request.date}-${request.city}-${request.barangay}`}>
                <div className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7]">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0f7f1] text-[#2f5d3a]">
                      <Icon icon="mdi:map-marker-outline" width={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1e1c1a]">
                        {request.city}
                      </p>
                      <p className="text-xs text-slate-500">
                        {request.barangay} · {request.landmark}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {request.date}
                  </span>
                </div>
                {i < mockRecentRequests.length - 1 && <Divider />}
              </div>
            ))}
          </div>

          <div className="border-t border-[#f0ece8] px-5 py-3">
            <Link
              href="/pop-up/requests"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#2f5d3a] opacity-70 transition-opacity hover:opacity-100"
            >
              View all requests <Icon icon="mdi:arrow-right" width={12} />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ebe7e3] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="px-5 pt-5">
            <SectionHeader title="Upcoming Schedule" href="/pop-up/schedule" />
          </div>

          <div>
            {mockUpcomingEvents.map((event, i) => (
              <div key={`${event.title}-${event.date.day}-${i}`}>
                <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[#faf9f7]">
                  <div className="flex min-w-[48px] flex-col items-center rounded-xl bg-[#f7f5f2] px-2 py-2 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                      {event.date.month}
                    </span>
                    <span className="mt-0.5 text-base font-bold leading-none text-[#1e1c1a]">
                      {event.date.day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1e1c1a]">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{event.location}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{event.time}</p>
                  </div>
                </div>
                {i < mockUpcomingEvents.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}