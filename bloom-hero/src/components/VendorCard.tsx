"use client";

import CartItem from "@/components/CartItem";

function IconStorefront({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

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
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border border-[#e6e2dd] bg-white px-4 py-3 shadow-sm">
        <input
          type="checkbox"
          checked={isVendorSelected}
          onChange={onVendorSelect}
          className="h-5 w-5 shrink-0 cursor-pointer accent-[#D24B46]"
          aria-label={`Select all from ${vendorName}`}
        />
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e6e2dd] bg-[#faf8f5] text-[#2f5d3a] shadow-sm">
          <IconStorefront />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#2f2f2f]">{vendorName}</p>
        <span className="shrink-0 text-[11px] font-semibold text-[#A39E96]">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3 pl-0 sm:pl-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-[#e6e2dd] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="px-4 py-4 sm:px-5 sm:py-5">
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
          </div>
        ))}
      </div>
    </div>
  );
}
