"use client";

import { X, MapPin, Search } from "lucide-react";
import { PopUpMapVendor } from "@/types";
import PopUpVendorButton from "./PopUpVendorButton";

interface PopUpMapSidebarProps {
  todayVendors: PopUpMapVendor[];
  upcomingVendors: PopUpMapVendor[];
  activeVendor: PopUpMapVendor | null;
  searchQuery: string;
  isSearching: boolean;
  onVendorSelect: (vendor: PopUpMapVendor) => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
}

export default function PopUpMapSidebar({
  todayVendors,
  upcomingVendors,
  activeVendor,
  searchQuery,
  isSearching,
  onVendorSelect,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
}: PopUpMapSidebarProps) {
  const totalCount = todayVendors.length + upcomingVendors.length;

  return (
    <div
      className="w-full md:w-[300px] flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-[#edeae6]"
      style={{ background: "#fdfaf7" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#ede9e2] flex flex-col gap-3">

        {/* Title + count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2f5d3a] animate-pulse" />
            <p className="font-bold text-[#1f1f1f] text-[13px] tracking-[0.5px] uppercase">
              Scheduled Pop-Ups
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#7a7a7a] bg-[#f0ece6] px-2 py-0.5 rounded-full">
            {totalCount} {totalCount === 1 ? "location" : "locations"}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#a0a0a0]" />
          <input
            type="text"
            placeholder="Search by name or area..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
            className="w-full pl-7 pr-14 py-2 text-[12px] rounded-lg bg-[#f0ece6] border border-transparent focus:border-[#c8dfd0] focus:outline-none placeholder-[#b0a9a3] text-[#1f1f1f] transition-colors"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={onSearchClear}
                className="w-4 h-4 rounded-full bg-[#c8c0b8] hover:bg-[#a09890] flex items-center justify-center transition-colors"
              >
                <X size={8} className="text-white" />
              </button>
            )}
            <button
              onClick={onSearchSubmit}
              disabled={isSearching}
              className="w-6 h-6 rounded-md bg-[#2f5d3a] hover:bg-[#254d30] flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Search size={11} className="text-white" />
            </button>
          </div>
        </div>

      </div>

      {/* Vendor list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-1 text-center px-4">
            <p className="text-[13px] font-medium text-[#a09a94]">No pop-ups found.</p>
            <p className="text-[11px] text-[#b0a9a3]">Try a different search.</p>
          </div>
        )}

        {todayVendors.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2f5d3a] animate-pulse" />
              <p className="text-[10px] font-bold text-[#2f5d3a] tracking-[1.2px] uppercase">Happening Now</p>
            </div>
            {todayVendors.map((vendor) => (
              <PopUpVendorButton
                key={vendor.id}
                vendor={vendor}
                isActive={activeVendor?.id === vendor.id}
                onClick={onVendorSelect}
              />
            ))}
          </>
        )}

        {upcomingVendors.length > 0 && (
          <>
            <div className={`flex items-center gap-2 px-3 py-2 ${todayVendors.length > 0 ? "mt-2" : ""}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a0b8a8]" />
              <p className="text-[10px] font-bold text-[#7a9a84] tracking-[1.2px] uppercase">Upcoming</p>
            </div>
            {upcomingVendors.map((vendor) => (
              <PopUpVendorButton
                key={vendor.id}
                vendor={vendor}
                isActive={activeVendor?.id === vendor.id}
                onClick={onVendorSelect}
              />
            ))}
          </>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 py-4 border-t border-[#edeae6] flex-shrink-0">
        <button className="w-full h-10 rounded-xl bg-[#d24b46] text-white font-semibold text-[13px] tracking-[0.3px] hover:bg-[#b93e3a] active:scale-[0.98] transition-all duration-150 shadow-sm shadow-[#d24b46]/20">
          Request a Pop-up
        </button>
      </div>

    </div>
  );
}