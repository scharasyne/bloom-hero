"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { mockVendors, type VendorRecord, type VendorStatus, type VendorType } from "@/lib/mockData";

// ── Skeleton card ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px] animate-pulse">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[12px] items-center">
          <div className="size-[20px] rounded-[6px] bg-[#e6e2dd]" />
          <div className="size-[44px] rounded-[12px] bg-[#e6e2dd]" />
          <div className="flex flex-col gap-[8px]">
            <div className="h-[24px] w-[200px] rounded-[8px] bg-[#e6e2dd]" />
            <div className="h-[18px] w-[140px] rounded-[8px] bg-[#e6e2dd]" />
          </div>
        </div>
        <div className="h-[24px] w-[88px] rounded-full bg-[#e6e2dd]" />
      </div>
      <div className="bg-[#e6e2dd] h-px w-full" />
      <div className="space-y-[10px] pl-[32px]">
        <div className="h-[18px] w-[260px] rounded-[8px] bg-[#e6e2dd]" />
        <div className="h-[18px] w-[200px] rounded-[8px] bg-[#e6e2dd]" />
        <div className="h-[18px] w-[180px] rounded-[8px] bg-[#e6e2dd]" />
      </div>
      <div className="flex gap-[12px] pl-[32px]">
        <div className="h-[44px] w-[120px] rounded-[12px] bg-[#e6e2dd]" />
        <div className="h-[44px] w-[120px] rounded-[12px] bg-[#e6e2dd]" />
      </div>
    </div>
  );
}

// ── Vendor card ────────────────────────────────────────────
function VendorCard({
  vendor,
  isSelected,
  onToggle,
  onSuspend,
  onUnsuspend,
}: {
  vendor:      VendorRecord;
  isSelected:  boolean;
  onToggle:    (id: string) => void;
  onSuspend:   (id: string) => void;
  onUnsuspend: (id: string) => void;
}) {
  const isSuspended = vendor.status === "suspended";
  const isMarket    = vendor.vendorType === "market";

  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px]">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[12px] items-center">

          {/* Checkbox */}
          <button
            onClick={() => onToggle(vendor.id)}
            className={`size-[20px] rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors
              ${isSelected ? "bg-[#2e7d5b] border-[#2e7d5b]" : "bg-white border-[#e6e2dd] hover:border-[#2e7d5b]"}`}
          >
            {isSelected && <Icon icon="mdi:check" width={14} height={14} className="text-white" />}
          </button>

          {/* Store icon */}
          <div className="size-[44px] rounded-[12px] bg-[#f3f2f0] flex items-center justify-center shrink-0">
            <Icon
              icon={isMarket ? "mdi:store-outline" : "mdi:calendar-star-outline"}
              width={22} height={22}
              className="text-[#7a746e]"
            />
          </div>

          {/* Name + type */}
          <div>
            <p className="font-semibold text-[18px] text-[#2c2a28] leading-[24px]">{vendor.storeName}</p>
            <p className="text-[13px] text-[#7a746e] mt-[2px]">
              {isMarket ? "Market stall" : "Pop-up vendor"}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-[6px] rounded-full px-[12px] py-[5px] text-[13px] font-semibold
          ${isSuspended ? "bg-[#fde4e1] text-[#c43c30]" : "bg-[#eaf3ef] text-[#2e7d5b]"}`}
        >
          <Icon
            icon={isSuspended ? "mdi:account-cancel-outline" : "mdi:account-check-outline"}
            width={14} height={14}
          />
          {isSuspended ? "Suspended" : "Active"}
        </span>
      </div>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* ── Details ────────────────────────────────────── */}
      <div className="flex flex-col gap-[6px] pl-[32px]">
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:account-outline" width={16} height={16} className="text-[#7a746e] shrink-0" />
          <span className="text-[14px] text-[#2c2a28]">{vendor.ownerName}</span>
          <span className="text-[#b8b2ab]">·</span>
          <span className="text-[14px] text-[#7a746e]">{vendor.email}</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:map-marker-outline" width={16} height={16} className="text-[#7a746e] shrink-0" />
          <span className="text-[14px] text-[#7a746e]">{vendor.location}</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:calendar-outline" width={16} height={16} className="text-[#7a746e] shrink-0" />
          <span className="text-[14px] text-[#7a746e]">Joined {vendor.joinedAt}</span>
          <span className="text-[#b8b2ab]">·</span>
          <span className="text-[14px] text-[#7a746e]">{vendor.totalOrders} orders</span>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────── */}
      <div className="flex gap-[12px] pl-[32px]">
        <button className="bg-white border border-[#e6e2dd] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium text-[#2c2a28] cursor-pointer hover:bg-[#f3f2f0] transition-colors">
          View profile
        </button>
        {isSuspended ? (
          <button
            onClick={() => onUnsuspend(vendor.id)}
            className="bg-[#eaf3ef] border border-[#e6e2dd] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium text-[#2e7d5b] cursor-pointer hover:bg-[#d6ecdf] transition-colors"
          >
            Unsuspend
          </button>
        ) : (
          <button
            onClick={() => onSuspend(vendor.id)}
            className="bg-[#fde4e1] border border-[#e6e2dd] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium text-[#c43c30] cursor-pointer hover:bg-[#fbd4d0] transition-colors"
          >
            Suspend
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function VendorsPage() {
  // TODO: swap mockVendors with data from useVendors() hook when ready
  const [vendors, setVendors]       = useState<VendorRecord[]>(mockVendors);
  const [activeFilter, setActiveFilter] = useState<VendorStatus | "all">("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const isLoading = false;

  // ── Filter + search ───────────────────────────────────
  const filtered = useMemo(() => {
    const byStatus = activeFilter === "all"
      ? vendors
      : vendors.filter((v) => v.status === activeFilter);
    const q = searchQuery.toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter(
      (v) =>
        v.storeName.toLowerCase().includes(q)  ||
        v.ownerName.toLowerCase().includes(q)  ||
        v.email.toLowerCase().includes(q)      ||
        v.location.toLowerCase().includes(q)
    );
  }, [vendors, activeFilter, searchQuery]);

  // ── Checkbox handlers ─────────────────────────────────
  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((v) => v.id)));
    }
  };

  // ── Suspend / unsuspend ───────────────────────────────
  const handleSuspend = (id: string) => {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: "suspended" } : v));
  };

  const handleUnsuspend = (id: string) => {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: "active" } : v));
  };

  const handleSuspendSelected = () => {
    setVendors((prev) =>
      prev.map((v) => selectedIds.has(v.id) ? { ...v, status: "suspended" } : v)
    );
    setSelectedIds(new Set());
  };

  const handleUnsuspendSelected = () => {
    setVendors((prev) =>
      prev.map((v) => selectedIds.has(v.id) ? { ...v, status: "active" } : v)
    );
    setSelectedIds(new Set());
  };

  const counts = {
    all:       vendors.length,
    active:    vendors.filter((v) => v.status === "active").length,
    suspended: vendors.filter((v) => v.status === "suspended").length,
  };

  return (
    <div className="flex flex-col gap-[32px]">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="font-semibold text-[40px] text-[#2c2a28] leading-[48px]">Vendors</h1>
          <p className="text-[#7a746e] text-[14px] mt-[4px]">
            {counts.all} vendor{counts.all !== 1 ? "s" : ""} · {counts.active} active · {counts.suspended} suspended
          </p>
        </div>
        <button className="bg-white border border-[#e6e2dd] flex gap-[6px] h-[44px] items-center justify-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
          <Icon icon="mdi:download-outline" width={18} height={18} />
          Export
        </button>
      </div>

      {/* ── Search + type filter ─────────────────────────── */}
      <div className="flex items-center gap-[12px] flex-wrap">
        <div className="bg-white border border-[#e6e2dd] flex gap-[10px] h-[38px] items-center pl-[12px] pr-[16px] rounded-[12px] w-[480px]">
          <Icon icon="mdi:magnify" width={20} height={20} className="text-[#7a746e] shrink-0" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-[14px] text-[#2c2a28] bg-transparent outline-none placeholder:text-[#7a746e]"
          />
        </div>
        {["All Types", "Market stall", "Pop-up"].map((label) => (
          <button
            key={label}
            className="bg-white border border-[#e6e2dd] flex gap-[6px] h-[38px] items-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors"
          >
            {label}
            <Icon icon="mdi:chevron-down" width={16} height={16} className="text-[#7a746e]" />
          </button>
        ))}
      </div>

      {/* ── Status filter chips ──────────────────────────── */}
      <div className="flex gap-[10px] items-center flex-wrap">

        {/* All */}
        <button
          onClick={() => setActiveFilter("all")}
          className={`flex gap-[8px] h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "all" ? "bg-[#e6e2dd]" : "bg-white hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:store-outline" width={16} height={16} className="text-[#2c2a28]" />
          <span className="text-[#2c2a28]">All: {counts.all}</span>
        </button>

        {/* Active */}
        <button
          onClick={() => setActiveFilter("active")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "active" ? "bg-[#c8e6d8]" : "bg-[#eaf3ef] hover:bg-[#d6ecdf]"}`}
        >
          <span className="text-[#2e7d5b]">Active: {counts.active}</span>
        </button>

        {/* Suspended */}
        <button
          onClick={() => setActiveFilter("suspended")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeFilter === "suspended" ? "bg-[#f9c8c4]" : "bg-[#fde4e1] hover:bg-[#fbd4d0]"}`}
        >
          <span className="text-[#c43c30]">Suspended: {counts.suspended}</span>
        </button>

      </div>

      {/* ── Bulk actions ─────────────────────────────────── */}
      <div className="flex gap-[12px] items-center flex-wrap">
        <button
          onClick={handleSelectAll}
          disabled={isLoading || filtered.length === 0}
          className="bg-[#e6e2dd] flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#d9d5d0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allSelected ? "☑" : "☐"} Select All
        </button>
        <button
          onClick={handleSuspendSelected}
          disabled={selectedIds.size === 0}
          className="bg-[#cc3526] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#b02d1e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✕ Suspend Selected
        </button>
        <button
          onClick={handleUnsuspendSelected}
          disabled={selectedIds.size === 0}
          className="bg-[#2e7d5b] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✓ Unsuspend Selected
        </button>
        {selectedIds.size > 0 && (
          <span className="text-[#7a746e] text-[14px]">{selectedIds.size} selected</span>
        )}
      </div>

      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* ── Cards / loading / empty ───────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col gap-[24px]">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
          <Icon icon="mdi:store-off-outline" width={64} height={64} className="text-[#b8b2ab]" />
          <p className="text-[#2c2a28] font-semibold text-[20px]">No vendors found</p>
          <p className="text-[#7a746e] text-[14px]">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-[24px] w-full">
          {filtered.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              isSelected={selectedIds.has(vendor.id)}
              onToggle={handleToggle}
              onSuspend={handleSuspend}
              onUnsuspend={handleUnsuspend}
            />
          ))}
        </div>
      )}

    </div>
  );
}