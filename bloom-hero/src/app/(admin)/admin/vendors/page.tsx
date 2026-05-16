"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { AdminVendorProfileModal } from "@/features/admin/components/AdminVendorProfileModal";
import { setVendorSuspensionStatus } from "@/features/admin/actions/setVendorSuspensionStatus";
import {
  useVendors,
  isNewlyAddedVendor,
  NEWLY_ADDED_VENDOR_DAYS,
  type VendorRecord,
  type VendorStatus,
} from "@/hooks/useVendors";
import type { BusinessType } from "@/features/vendors/types";

type BusinessTypeFilter = "all" | BusinessType;
type StatusFilter = "all" | VendorStatus;
type InsightFilter =
  | "all"
  | "newly_added"
  | "appeal_pending"
  | "appeal_submitted"
  | "recently_suspended";

const BUSINESS_TYPE_OPTIONS: { value: BusinessTypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "registered", label: "Registered" },
  { value: "unregistered", label: "Unregistered" },
];

const INSIGHT_OPTIONS: { value: InsightFilter; label: string }[] = [
  { value: "all", label: "All vendors" },
  { value: "newly_added", label: `Newly added (${NEWLY_ADDED_VENDOR_DAYS}d)` },
  { value: "appeal_pending", label: "Appeal pending" },
  { value: "appeal_submitted", label: "Appeal submitted" },
  { value: "recently_suspended", label: "Recently suspended" },
];

function FilterMenu<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = options.find((option) => option.value === value)?.label ?? label;

  const isActive = value !== options[0]?.value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-white border flex gap-[6px] h-[38px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors
          ${isActive ? "border-[#2e7d5b] text-[#2e7d5b]" : "border-[#e6e2dd] text-[#2c2a28] hover:bg-[#f3f2f0]"}`}
      >
        {active}
        <Icon icon="mdi:chevron-down" width={16} height={16} className="text-[#7a746e]" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[200px] rounded-[12px] border border-[#e6e2dd] bg-white py-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-[14px] hover:bg-[#f3f2f0] ${
                  value === option.value ? "font-semibold text-[#2e7d5b]" : "text-[#2c2a28]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

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
    </div>
  );
}

function VendorCard({
  vendor,
  isSelected,
  onToggle,
  onSuspend,
  onUnsuspend,
  onViewProfile,
}: {
  vendor: VendorRecord;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSuspend: (id: string) => void;
  onUnsuspend: (id: string) => void;
  onViewProfile: (vendor: VendorRecord) => void;
}) {
  const isSuspended = vendor.status === "suspended";
  const isRegistered = vendor.businessType === "registered";

  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between w-full">
        <div className="flex gap-[12px] items-center min-w-0">
          <button
            type="button"
            onClick={() => onToggle(vendor.id)}
            className={`size-[20px] rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors
              ${isSelected ? "bg-[#2e7d5b] border-[#2e7d5b]" : "bg-white border-[#e6e2dd] hover:border-[#2e7d5b]"}`}
          >
            {isSelected && <Icon icon="mdi:check" width={14} height={14} className="text-white" />}
          </button>
          <div className="size-[44px] rounded-[12px] bg-[#f3f2f0] flex items-center justify-center shrink-0">
            <Icon
              icon={isRegistered ? "mdi:store-outline" : "mdi:calendar-star-outline"}
              width={22}
              height={22}
              className="text-[#7a746e]"
            />
          </div>
          <div>
            <p className="font-semibold text-[18px] text-[#2c2a28] leading-[24px]">{vendor.storeName}</p>
            <p className="text-[13px] text-[#7a746e] mt-[2px]">
              {isRegistered ? "Registered business" : "Unregistered business"}
            </p>
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-1.5 sm:flex-col sm:items-end">
          <span
            className={`inline-flex items-center gap-[6px] rounded-full px-[12px] py-[5px] text-[13px] font-semibold
              ${isSuspended ? "bg-[#fde4e1] text-[#c43c30]" : "bg-[#eaf3ef] text-[#2e7d5b]"}`}
          >
            <Icon
              icon={isSuspended ? "mdi:account-cancel-outline" : "mdi:account-check-outline"}
              width={14}
              height={14}
            />
            {isSuspended ? "Suspended" : "Active"}
          </span>
          {vendor.pendingAppeal ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7f6] px-2.5 py-0.5 text-[11px] font-semibold text-[#D24B46]">
              <Icon icon="mdi:gavel" width={12} height={12} />
              Appeal pending
            </span>
          ) : null}
        </div>
      </div>

      <div className="bg-[#e6e2dd] h-px w-full" />

      <div className="flex flex-col gap-[6px] pl-0 sm:pl-[32px]">
        <div className="flex items-center gap-[8px] flex-wrap">
          <Icon icon="mdi:account-outline" width={16} height={16} className="text-[#7a746e] shrink-0" />
          <span className="text-[14px] text-[#2c2a28]">{vendor.ownerName}</span>
          <span className="text-[#b8b2ab]">·</span>
          <span className="text-[14px] text-[#7a746e]">{vendor.email}</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:map-marker-outline" width={16} height={16} className="text-[#7a746e] shrink-0" />
          <span className="text-[14px] text-[#7a746e]">{vendor.location}</span>
        </div>
        <div className="flex items-center gap-[8px] flex-wrap">
          <Icon icon="mdi:calendar-outline" width={16} height={16} className="text-[#7a746e] shrink-0" />
          <span className="text-[14px] text-[#7a746e]">Joined {vendor.joinedAt}</span>
          {isSuspended && vendor.suspendedAt ? (
            <>
              <span className="text-[#b8b2ab]">·</span>
              <span className="text-[14px] text-[#c43c30]">
                Suspended{" "}
                {new Date(vendor.suspendedAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex gap-[12px] pl-0 sm:pl-[32px] flex-wrap">
        <button
          type="button"
          onClick={() => onViewProfile(vendor)}
          className="bg-white border border-[#e6e2dd] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium text-[#2c2a28] cursor-pointer hover:bg-[#f3f2f0] transition-colors"
        >
          View profile
        </button>
        {isSuspended ? (
          <button
            type="button"
            onClick={() => onUnsuspend(vendor.id)}
            className="bg-[#eaf3ef] border border-[#e6e2dd] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium text-[#2e7d5b] cursor-pointer hover:bg-[#d6ecdf] transition-colors"
          >
            Unsuspend
          </button>
        ) : (
          <button
            type="button"
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

function matchesInsight(vendor: VendorRecord, insight: InsightFilter) {
  if (insight === "all") return true;
  if (insight === "newly_added") return isNewlyAddedVendor(vendor.createdAtIso);
  if (insight === "appeal_pending") return Boolean(vendor.pendingAppeal);
  if (insight === "appeal_submitted") return vendor.appeals.length > 0;
  if (insight === "recently_suspended") {
    if (!vendor.suspendedAt) return false;
    return isNewlyAddedVendor(vendor.suspendedAt);
  }
  return true;
}

export default function VendorsPage() {
  const { data: vendors, isLoading, error, reload } = useVendors();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<BusinessTypeFilter>("all");
  const [insightFilter, setInsightFilter] = useState<InsightFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [profileVendor, setProfileVendor] = useState<VendorRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const filtered = useMemo(() => {
    let list = vendors;

    if (statusFilter !== "all") {
      list = list.filter((vendor) => vendor.status === statusFilter);
    }
    if (businessTypeFilter !== "all") {
      list = list.filter((vendor) => vendor.businessType === businessTypeFilter);
    }
    list = list.filter((vendor) => matchesInsight(vendor, insightFilter));

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (vendor) =>
        vendor.storeName.toLowerCase().includes(q) ||
        vendor.ownerName.toLowerCase().includes(q) ||
        vendor.email.toLowerCase().includes(q) ||
        vendor.location.toLowerCase().includes(q)
    );
  }, [vendors, statusFilter, businessTypeFilter, insightFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      all: vendors.length,
      active: vendors.filter((vendor) => vendor.status === "active").length,
      suspended: vendors.filter((vendor) => vendor.status === "suspended").length,
      appealPending: vendors.filter((vendor) => vendor.pendingAppeal).length,
      newlyAdded: vendors.filter((vendor) => isNewlyAddedVendor(vendor.createdAtIso)).length,
    }),
    [vendors]
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  const handleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map((vendor) => vendor.id)));
  };

  const handleSuspend = async (id: string) => {
    const reason = window.prompt("Enter suspension reason:")?.trim();
    if (!reason) {
      setActionError("Suspension reason is required.");
      return;
    }
    setActionError(null);
    setIsMutating(true);
    const result = await setVendorSuspensionStatus(id, true, reason);
    if (!result.ok) {
      setActionError(result.error ?? "Failed to suspend vendor.");
      setIsMutating(false);
      return;
    }
    await reload();
    setIsMutating(false);
  };

  const handleUnsuspend = async (id: string) => {
    setActionError(null);
    setIsMutating(true);
    const result = await setVendorSuspensionStatus(id, false);
    if (!result.ok) {
      setActionError(result.error ?? "Failed to unsuspend vendor.");
      setIsMutating(false);
      return;
    }
    await reload();
    setIsMutating(false);
  };

  const handleSuspendSelected = async () => {
    const reason = window.prompt("Enter suspension reason for selected vendors:")?.trim();
    if (!reason) {
      setActionError("Suspension reason is required.");
      return;
    }
    setActionError(null);
    setIsMutating(true);
    for (const id of selectedIds) {
      const result = await setVendorSuspensionStatus(id, true, reason);
      if (!result.ok) {
        setActionError(result.error ?? "Failed to suspend one or more vendors.");
        setIsMutating(false);
        return;
      }
    }
    setSelectedIds(new Set());
    await reload();
    setIsMutating(false);
  };

  const handleUnsuspendSelected = async () => {
    setActionError(null);
    setIsMutating(true);
    for (const id of selectedIds) {
      const result = await setVendorSuspensionStatus(id, false);
      if (!result.ok) {
        setActionError(result.error ?? "Failed to unsuspend one or more vendors.");
        setIsMutating(false);
        return;
      }
    }
    setSelectedIds(new Set());
    await reload();
    setIsMutating(false);
  };

  const openProfile = (vendor: VendorRecord) => {
    setProfileVendor(vendor);
  };

  const profileVendorLive = profileVendor
    ? vendors.find((vendor) => vendor.id === profileVendor.id) ?? profileVendor
    : null;

  return (
    <div className="flex flex-col gap-[32px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <h1 className="font-semibold text-2xl sm:text-3xl lg:text-[40px] text-[#2c2a28] leading-tight lg:leading-[48px]">Vendors</h1>
          <p className="text-[#7a746e] text-[14px] mt-[4px]">
            {counts.all} vendor{counts.all !== 1 ? "s" : ""} · {counts.active} active ·{" "}
            {counts.suspended} suspended
            {counts.appealPending > 0 ? ` · ${counts.appealPending} appeal pending` : ""}
          </p>
        </div>
        <button
          type="button"
          className="bg-white border border-[#e6e2dd] flex gap-[6px] h-[44px] items-center justify-center px-[14px] rounded-[12px] text-[#2c2a28] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors"
        >
          <Icon icon="mdi:download-outline" width={18} height={18} />
          Export
        </button>
      </div>

      <div className="flex items-center gap-[12px] flex-wrap">
        <div className="bg-white border border-[#e6e2dd] flex gap-[10px] h-[38px] items-center pl-[12px] pr-[16px] rounded-[12px] w-full max-w-[480px]">
          <Icon icon="mdi:magnify" width={20} height={20} className="text-[#7a746e] shrink-0" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex-1 text-[14px] text-[#2c2a28] bg-transparent outline-none placeholder:text-[#7a746e]"
          />
        </div>
        <FilterMenu
          label="All types"
          value={businessTypeFilter}
          options={BUSINESS_TYPE_OPTIONS}
          onChange={setBusinessTypeFilter}
        />
        <FilterMenu
          label="All vendors"
          value={insightFilter}
          options={INSIGHT_OPTIONS}
          onChange={setInsightFilter}
        />
      </div>

      <div className="flex gap-[10px] items-center flex-wrap">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`flex gap-[8px] h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${statusFilter === "all" ? "bg-[#e6e2dd]" : "bg-white hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:store-outline" width={16} height={16} className="text-[#2c2a28]" />
          <span className="text-[#2c2a28]">All: {counts.all}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${statusFilter === "active" ? "bg-[#c8e6d8]" : "bg-[#eaf3ef] hover:bg-[#d6ecdf]"}`}
        >
          <span className="text-[#2e7d5b]">Active: {counts.active}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("suspended")}
          className={`flex h-[40px] items-center px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${statusFilter === "suspended" ? "bg-[#f9c8c4]" : "bg-[#fde4e1] hover:bg-[#fbd4d0]"}`}
        >
          <span className="text-[#c43c30]">Suspended: {counts.suspended}</span>
        </button>
        {counts.appealPending > 0 ? (
          <button
            type="button"
            onClick={() => setInsightFilter("appeal_pending")}
            className={`flex h-[40px] items-center gap-1.5 px-[14px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
              ${insightFilter === "appeal_pending" ? "bg-[#fff0ee]" : "bg-[#fff7f6] hover:bg-[#fde4e1]"}`}
          >
            <Icon icon="mdi:gavel" width={16} height={16} className="text-[#D24B46]" />
            <span className="text-[#D24B46]">Appeals: {counts.appealPending}</span>
          </button>
        ) : null}
      </div>

      <div className="flex gap-[12px] items-center flex-wrap">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={isLoading || isMutating || filtered.length === 0}
          className="bg-[#e6e2dd] flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#d9d5d0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allSelected ? "☑" : "☐"} Select All
        </button>
        <button
          type="button"
          onClick={handleSuspendSelected}
          disabled={isMutating || selectedIds.size === 0}
          className="bg-[#cc3526] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#b02d1e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✕ Suspend Selected
        </button>
        <button
          type="button"
          onClick={handleUnsuspendSelected}
          disabled={isMutating || selectedIds.size === 0}
          className="bg-[#2e7d5b] text-white flex gap-[8px] h-[44px] items-center px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ✓ Unsuspend Selected
        </button>
        {selectedIds.size > 0 ? (
          <span className="text-[#7a746e] text-[14px]">{selectedIds.size} selected</span>
        ) : null}
      </div>

      <div className="bg-[#e6e2dd] h-px w-full" />

      {error ? <p className="text-[14px] text-[#c43c30]">Failed to load vendors: {error}</p> : null}
      {actionError ? <p className="text-[14px] text-[#c43c30]">{actionError}</p> : null}

      {isLoading ? (
        <div className="flex flex-col gap-[24px]">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
          <Icon icon="mdi:store-off-outline" width={64} height={64} className="text-[#b8b2ab]" />
          <p className="text-[#2c2a28] font-semibold text-[20px]">No vendors found</p>
          <p className="text-[#7a746e] text-[14px]">Try adjusting your search or filters.</p>
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
              onViewProfile={openProfile}
            />
          ))}
        </div>
      )}

      <AdminVendorProfileModal
        vendor={profileVendorLive}
        isOpen={Boolean(profileVendorLive)}
        onUpdated={() => void reload()}
        onClose={() => setProfileVendor(null)}
      />
    </div>
  );
}
