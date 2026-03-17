"use client";

import { Icon } from "@iconify/react";
import CartItem from "@/components/CartItem";

const GRID = "grid grid-cols-[minmax(0,1fr)_160px_120px_140px] items-center gap-[12px]";

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
    <div className="bg-white rounded-[8px] border border-[#e8e8e8] overflow-hidden">

      {/* Vendor row */}
      <div className="flex items-center gap-[10px] px-[20px] py-[12px] border-b border-[#f0f0f0]">
        <input
          type="checkbox"
          checked={isVendorSelected}
          onChange={onVendorSelect}
          className="w-[18px] h-[18px] accent-[#D96A63] cursor-pointer"
        />
        <span className="text-[13px] font-semibold text-[#333]">{vendorName}</span>
        <Icon icon="mdi:chevron-right" width={16} height={16} className="text-[#aaa]" />
      </div>

      {/* Column headers */}
      <div className={`${GRID} px-[20px] py-[10px] border-b border-[#f0f0f0]`}>
        <span className="text-[13px] font-semibold text-[#333]">Item</span>
        <span className="text-[13px] font-semibold text-[#333] text-center">Quantity</span>
        <span className="text-[13px] font-semibold text-[#333] text-center">Price</span>
        <span className="text-[13px] font-semibold text-[#333] text-center">Total</span>
      </div>

      {/* Items */}
      {items.map((item, index) => (
        <div key={item.id}>
          <div className="px-[20px] py-[16px]">
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
          {index < items.length - 1 && (
            <div className="border-t border-[#f0f0f0] mx-[20px]" />
          )}
        </div>
      ))}

    </div>
  );
}
