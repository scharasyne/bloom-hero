"use client";

import { Icon } from "@iconify/react";
import CartItem from "@/components/CartItem";

const DESKTOP_HEADERS =
  "hidden md:grid md:grid-cols-[minmax(0,1fr)_140px_100px_120px] md:items-center md:gap-3";

type VendorCardProps = {
  vendorName: string;
  items: any[];
  selectedIds: Set<string>;
  isVendorSelected: boolean;
  onVendorSelect: () => void;
  onItemSelect: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function VendorCard({
  vendorName,
  items,
  selectedIds,
  isVendorSelected,
  onVendorSelect,
  onItemSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: VendorCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#f0ece8] px-4 py-4 sm:px-5">
        <input
          type="checkbox"
          checked={isVendorSelected}
          onChange={onVendorSelect}
          className="h-5 w-5 cursor-pointer accent-[#D24B46]"
        />
        <span className="text-sm font-semibold text-[#2D2926] sm:text-base">{vendorName}</span>
        <Icon icon="mdi:chevron-right" width={18} height={18} className="ml-auto text-[#c0b8b0]" />
      </div>

      <div className={`${DESKTOP_HEADERS} border-b border-[#f0ece8] px-5 py-3`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6D6863]">Item</span>
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-[#6D6863]">
          Quantity
        </span>
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-[#6D6863]">
          Price
        </span>
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-[#6D6863]">
          Total
        </span>
      </div>

      {items.map((item, index) => (
        <div key={item.id}>
          <div className="px-4 py-5 sm:px-5 sm:py-6">
            <CartItem
              item={item}
              index={index}
              isSelected={selectedIds.has(item.id)}
              onSelect={onItemSelect}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />
          </div>
          {index < items.length - 1 && <div className="mx-4 border-t border-[#f0ece8] sm:mx-5" />}
        </div>
      ))}
    </div>
  );
}
