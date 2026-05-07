"use client";

import { PopUpMapVendor } from "@/typess";

interface PopUpVendorButtonProps {
  vendor: PopUpMapVendor;
  isActive: boolean;
  onClick: (vendor: PopUpMapVendor) => void;
}

export default function PopUpVendorButton({ vendor, isActive, onClick }: PopUpVendorButtonProps) {
  return (
    <button
      onClick={() => onClick(vendor)}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group ${
        isActive
          ? "bg-[#eef4f0] border border-[#cce0d4]"
          : "hover:bg-[#f5f1ec] border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center transition-colors ${
          isActive ? "bg-[#2f5d3a]" : "bg-[#a0b8a8] group-hover:bg-[#2f5d3a]"
        }`}>
          {vendor.displayNumber}
        </span>
        <p className="font-semibold text-[#1f1f1f] text-[13px] leading-snug truncate">
          {vendor.name}
        </p>
      </div>
    </button>
  );
}