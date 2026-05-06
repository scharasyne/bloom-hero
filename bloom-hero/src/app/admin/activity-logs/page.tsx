"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { ActivityLogType } from "@/typess";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import ActivityLogCard from "@/components/admin/ActivityLogCard";

// ── Skeleton card ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] p-[20px] flex flex-col gap-[14px] animate-pulse">
      <div className="flex gap-[12px] items-center">
        <div className="size-[20px] rounded-[6px] bg-[#e6e2dd]" />
        <div className="h-[24px] w-[80px] rounded-[8px] bg-[#e6e2dd]" />
        <div className="h-[24px] w-[100px] rounded-[8px] bg-[#e6e2dd]" />
      </div>
      <div className="bg-[#e6e2dd] h-px w-full" />
      <div className="h-[20px] w-[240px] rounded-[8px] bg-[#e6e2dd] ml-[12px]" />
      <div className="h-[20px] w-[180px] rounded-[8px] bg-[#e6e2dd] ml-[12px]" />
      <div className="flex gap-[8px] ml-[12px]">
        <div className="h-[32px] w-[120px] rounded-[12px] bg-[#e6e2dd]" />
        <div className="h-[32px] w-[80px] rounded-[12px] bg-[#e6e2dd]" />
      </div>
    </div>
  );
}

const FILTER_CHIPS: { label: string; value: ActivityLogType | "all" }[] = [
  { label: "All",          value: "all"       },
  { label: "Approvals",    value: "approved"  },
  { label: "Rejections",   value: "rejected"  },
  { label: "Suspensions",  value: "suspended" },
  { label: "Unsuspensions", value: "unsuspended" },
  { label: "Logins",       value: "login"     },
  { label: "Logouts",      value: "logout"    },
];

const chipActive: Record<string, string> = {
  all:         "bg-white border border-[#e6e2dd] text-[#2c2a28]",
  approved:    "bg-[#eaf3ef] border border-[#e6e2dd] text-[#2e7d5b]",
  rejected:    "bg-[#fde4e1] border border-[#e6e2dd] text-[#c43c30]",
  suspended:   "bg-[#f7e8d8] border border-[#e6e2dd] text-[#b86a2a]",
  unsuspended: "bg-[#eaf3ef] border border-[#e6e2dd] text-[#2e7d5b]",
  login:       "bg-[#e3f2fd] border border-[#e6e2dd] text-[#1565c0]",
};

// ✅ Only change: outer layout shell removed — layout.tsx now owns bg, height, padding, sidebar offset
export default function ActivityLogsPage() {
  const [activeFilter, setActiveFilter] = useState<ActivityLogType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allLogs, isLoading } = useActivityLogs();

  const logCounts = useMemo(() => {
    return {
      all: allLogs.length,
      approved: allLogs.filter((log) => log.actionType === "approved").length,
      rejected: allLogs.filter((log) => log.actionType === "rejected").length,
      suspended: allLogs.filter((log) => log.actionType === "suspended").length,
      unsuspended: allLogs.filter((log) => log.actionType === "unsuspended").length,
      login: allLogs.filter((log) => log.actionType === "login").length,
      logout: allLogs.filter((log) => log.actionType === "logout").length,
    };
  }, [allLogs]);

  const logs = activeFilter === "all" ? allLogs : allLogs.filter((l) => l.actionType === activeFilter);

  // Client-side search filter
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.actionTitle.toLowerCase().includes(q) ||
        l.targetName.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  // Group by date label
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const grouped = filteredLogs.reduce<Record<string, typeof filteredLogs>>(
    (acc, log) => {
      const d = new Date(log.timestamp).toDateString();
      const label = d === today ? "Today" : d === yesterday ? "Yesterday" : d;
      acc[label] = [...(acc[label] ?? []), log];
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-[24px]">

      {/* Header */}
      <h1 className="font-semibold text-[40px] text-[#2c2a28] leading-[48px]">
        Activity Logs
      </h1>

      {/* Search + Export */}
      <div className="flex items-center justify-between w-full">
        <div className="bg-white border border-[#e6e2dd] flex gap-[10px] h-[38px] items-center pl-[12px] pr-[16px] rounded-[12px] w-[480px]">
          <Icon icon="mdi:magnify" width={20} height={20} className="text-[#7a746e] shrink-0" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-[14px] text-[#2c2a28] bg-transparent outline-none placeholder:text-[#7a746e]"
          />
        </div>

        <div className="flex gap-[12px] items-center">
          {/* Dropdown filters — UI only */}
          {["All Actions", "Today", "All Admins"].map((label) => (
            <button
              key={label}
              className="bg-white border border-[#e6e2dd] flex gap-[6px] h-[38px] items-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors"
            >
              {label}
              <Icon icon="mdi:chevron-down" width={16} height={16} className="text-[#7a746e]" />
            </button>
          ))}
          {/* Export — UI only */}
          <button className="bg-white border border-[#e6e2dd] flex h-[38px] items-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-[10px] items-center flex-wrap">

        {/* All */}
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex gap-[8px] h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "all" ? "bg-[#e6e2dd]" : "bg-white hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:view-grid" width={16} height={16} className="text-[#2c2a28]" />
          <span className="text-[#2c2a28]">All: {logCounts.all}</span>
        </button>

        {/* Approvals */}
        <button
          onClick={() => setActiveFilter("approved")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "approved" ? "bg-[#c8e6d8]" : "bg-[#eaf3ef] hover:bg-[#d6ecdf]"}`}
        >
          <span className="text-[#2e7d5b]">Approvals: {logCounts.approved}</span>
        </button>

        {/* Rejections */}
        <button
          onClick={() => setActiveFilter("rejected")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "rejected" ? "bg-[#f9c8c4]" : "bg-[#fde4e1] hover:bg-[#fbd4d0]"}`}
        >
          <span className="text-[#c43c30]">Rejections: {logCounts.rejected}</span>
        </button>

        {/* Suspensions */}
        <button
          onClick={() => setActiveFilter("suspended")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "suspended" ? "bg-[#f0d0b0]" : "bg-[#f7e8d8] hover:bg-[#f2dcc4]"}`}
        >
          <span className="text-[#b86a2a]">Suspensions: {logCounts.suspended}</span>
        </button>

        {/* Unsuspensions */}
        <button
          onClick={() => setActiveFilter("unsuspended")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "unsuspended" ? "bg-[#c8e6d8]" : "bg-[#eaf3ef] hover:bg-[#d6ecdf]"}`}
        >
          <span className="text-[#2e7d5b]">Unsuspensions: {logCounts.unsuspended}</span>
        </button>

        {/* Logins */}
        <button
          onClick={() => setActiveFilter("login")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "login" ? "bg-[#bad8f5]" : "bg-[#e3f2fd] hover:bg-[#cce5fa]"}`}
        >
          <span className="text-[#1565c0]">Logins: {logCounts.login}</span>
        </button>

        {/* Logouts */}
        <button
          onClick={() => setActiveFilter("logout")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "logout" ? "bg-[#d4d1cc]" : "bg-[#f2f0ed] hover:bg-[#e8e5e1]"}`}
        >
          <span className="text-[#7a746e]">Logouts: {logCounts.logout}</span>
        </button>

      </div>

      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* Cards */}
      {isLoading ? (
        <div className="flex flex-col gap-[24px]">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
          <Icon icon="mdi:file-search-outline" width={64} height={64} className="text-[#b8b2ab]" />
          <p className="text-[#2c2a28] font-semibold text-[20px]">No logs found</p>
          <p className="text-[#7a746e] text-[14px]">Try adjusting your search or filter.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, dateLogs]) => (
          <div key={dateLabel} className="flex flex-col gap-[16px]">
            {/* Date group header */}
            <div className="bg-white rounded-[16px] border border-[#e6e2dd] px-[24px] py-[18px] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)]">
              <span className="font-semibold text-[20px] text-[#2c2a28]">
                {dateLabel}
                {dateLabel === "Today" || dateLabel === "Yesterday" ? (
                  <span className="font-medium text-[#7a746e]">
                    {" — "}
                    {new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                ) : null}
              </span>
            </div>
            {dateLogs.map((log) => (
              <ActivityLogCard key={log.id} log={log} />
            ))}
          </div>
        ))
      )}

    </div>
  );
}