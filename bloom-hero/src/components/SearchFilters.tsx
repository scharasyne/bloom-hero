"use client";

import { Icon } from "@iconify/react";

const PRICE_OPTIONS = ["Any", "<500", "500-700", ">700"];
const SORT_OPTIONS = ["Best Sellers", "Price: Low to High", "Price: High to Low"];

const PRICE_LABELS: Record<string, string> = {
  Any: "Price: Any",
  "<500": "< ₱500",
  "500-700": "₱500–700",
  ">700": "> ₱700",
};

const SORT_LABELS: Record<string, string> = {
  "Best Sellers": "Best Sellers",
  "Price: Low to High": "Price: Low to High",
  "Price: High to Low": "Price: High to Low",
};

interface Props {
  price: string;
  onPriceChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
}

function FilterPill({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all border ${
          active
            ? "bg-[#2f5d3a] text-white border-[#2f5d3a]"
            : "bg-white text-[#1f1f1f] border-[#e0dbd3] hover:border-[#c5bfb7] hover:bg-[#faf8f5]"
        }`}
      >
        {label}
        <Icon
          icon="mdi:chevron-down"
          width={14}
          height={14}
          color={active ? "white" : "#7a7a7a"}
        />
      </button>
      <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e5e0d8] rounded-2xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)] z-20 min-w-[160px] py-1.5 hidden group-focus-within:block">
        {children}
      </div>
    </div>
  );
}

function DropdownItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-[13px] transition-colors rounded-xl mx-auto flex items-center justify-between gap-3 hover:bg-[#f5f2ed] ${
        selected ? "font-semibold text-[#d24b46]" : "text-[#1f1f1f]"
      }`}
    >
      {label}
      {selected && <Icon icon="mdi:check" width={14} height={14} color="#d24b46" />}
    </button>
  );
}

export default function SearchFilters({ price, onPriceChange, sort, onSortChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">

      {/* Price pill */}
      <FilterPill
        label={price === "Any" ? "Price" : PRICE_LABELS[price]}
        active={price !== "Any"}
      >
        {PRICE_OPTIONS.map((opt) => (
          <DropdownItem
            key={opt}
            label={PRICE_LABELS[opt]}
            selected={price === opt}
            onClick={() => onPriceChange(opt)}
          />
        ))}
      </FilterPill>

      {/* Sort pill */}
      <FilterPill
        label={SORT_LABELS[sort]}
        active={sort !== "Best Sellers"}
      >
        {SORT_OPTIONS.map((opt) => (
          <DropdownItem
            key={opt}
            label={SORT_LABELS[opt]}
            selected={sort === opt}
            onClick={() => onSortChange(opt)}
          />
        ))}
      </FilterPill>

      {/* More Filters pill — static for now */}
      <button
        type="button"
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border border-[#e0dbd3] bg-white text-[#1f1f1f] hover:border-[#c5bfb7] hover:bg-[#faf8f5] transition-all"
      >
        <Icon icon="mdi:tune-variant" width={14} height={14} color="#7a7a7a" />
        Filters
      </button>

    </div>
  );
}