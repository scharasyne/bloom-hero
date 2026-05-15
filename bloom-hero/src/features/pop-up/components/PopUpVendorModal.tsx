"use client";

import Link from "next/link";
import { X, MapPin, Calendar, User } from "lucide-react";
import { PopUpMapVendor } from "@/types";
import { publicVendorProfilePath } from "@/features/vendors/utils/publicVendorPaths";

interface PopUpVendorModalProps {
  vendor: PopUpMapVendor;
  onClose: () => void;
  showProfileLink?: boolean;
}

export default function PopUpVendorModal({
  vendor,
  onClose,
  showProfileLink = true,
}: PopUpVendorModalProps) {
  return (
    <div className="absolute top-3 right-3 z-[1000] w-[280px] overflow-hidden rounded-2xl border border-[#e8e2da] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
      <div className="relative flex items-center justify-center px-4 pb-2 pt-4">
        <p className="text-center text-[16px] font-bold leading-snug text-[#1f1f1f]">{vendor.name}</p>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#f0ece6] transition-colors hover:bg-[#e0dbd3]"
          aria-label="Close"
        >
          <X size={11} className="text-[#7a7a7a]" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#eef4f0]">
            <MapPin size={12} className="text-[#2f5d3a]" />
          </div>
          <p className="pt-1 text-[12px] leading-snug text-[#4a4a4a]">{vendor.address}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#eef4f0]">
            <Calendar size={12} className="text-[#2f5d3a]" />
          </div>
          <p className="text-[12px] text-[#4a4a4a]">
            {vendor.startDate} – {vendor.endDate}
          </p>
        </div>
      </div>

      {showProfileLink ? (
        <div className="px-4 pb-4">
          <Link
            href={publicVendorProfilePath(vendor.vendorId)}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#2f5d3a] text-[12px] font-semibold tracking-[0.4px] text-white shadow-sm shadow-[#2f5d3a]/20 transition-all duration-150 hover:bg-[#254d30] active:scale-[0.98]"
          >
            <User size={12} />
            View Profile
          </Link>
        </div>
      ) : null}
    </div>
  );
}
