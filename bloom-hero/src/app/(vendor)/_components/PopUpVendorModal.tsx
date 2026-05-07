"use client";

import { X, MapPin, Calendar, User } from "lucide-react";
import { PopUpMapVendor } from "@/typess";

interface PopUpVendorModalProps {
  vendor: PopUpMapVendor;
  onClose: () => void;
}

export default function PopUpVendorModal({ vendor, onClose }: PopUpVendorModalProps) {
  return (
    <div className="absolute top-3 right-3 z-[1000] w-[280px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-[#e8e2da] overflow-hidden">
      
      <div className="relative px-4 pt-4 pb-2 flex items-center justify-center">
        <p className="font-bold text-[#1f1f1f] text-[16px] leading-snug text-center">
          {vendor.name}
        </p>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-6 h-6 rounded-full bg-[#f0ece6] hover:bg-[#e0dbd3] flex items-center justify-center transition-colors"
        >
          <X size={11} className="text-[#7a7a7a]" />
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#eef4f0] flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin size={12} className="text-[#2f5d3a]" />
          </div>
          <p className="text-[#4a4a4a] text-[12px] leading-snug pt-1">
            {vendor.address}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#eef4f0] flex items-center justify-center flex-shrink-0">
            <Calendar size={12} className="text-[#2f5d3a]" />
          </div>
          <p className="text-[#4a4a4a] text-[12px]">
            {vendor.startDate} – {vendor.endDate}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button className="w-full h-9 rounded-xl bg-[#2f5d3a] text-white font-semibold text-[12px] tracking-[0.4px] hover:bg-[#254d30] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm shadow-[#2f5d3a]/20">
          <User size={12} />
          View Profile
        </button>
      </div>

    </div>
  );
}