import React from "react";
import { Icon } from "@iconify/react";

export interface SearchFiltersProps {
  price: string;
  onPriceChange: (price: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
}

function Chip({ label, active = false, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer content-stretch flex items-center justify-center px-3.5 py-2 relative rounded-[999px] shrink-0 ${
        active ? "bg-[#2f5d3a]" : "bg-[#efeae4]"
      }`}
    >
      <div
        className={`flex flex-col font-medium justify-center leading-0 relative shrink-0 text-[14px] text-center tracking-[-0.07px] whitespace-nowrap ${
          active ? "text-white" : "text-[#1f1f1f]"
        }`}
      >
        <p className="leading-[1.45]">{label}</p>
      </div>
    </div>
  );
}

// category chips removed since products table has no category


interface DropdownPillProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function DropdownPill({ value, options, onChange }: DropdownPillProps) {
  return (
    <div className="relative">
      <select
        className="bg-white appearance-none flex items-center gap-1.5 px-3.5 py-2 rounded-2xl shrink-0 text-[14px] text-[#1f1f1f]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <Icon icon="mdi:chevron-down" width={12} height={12} color="#1f1f1f" />
      </div>
    </div>
  );
}

function Filters({ price, sort, onPriceChange, onSortChange }: {
  price: string;
  sort: string;
  onPriceChange: (val: string) => void;
  onSortChange: (val: string) => void;
}) {
  const priceOptions = ["Any", "<500", "500-700", ">700"];
  const sortOptions = ["Best Sellers", "Price: Low to High", "Price: High to Low"];

  return (
    <div className="bg-[#f7f4ef] content-stretch flex flex-wrap gap-3 items-center justify-center relative rounded-2xl shrink-0">
      <div
        aria-hidden="true"
        className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-2xl"
      />
      <DropdownPill value={price} options={priceOptions} onChange={onPriceChange} />
      <DropdownPill value={sort} options={sortOptions} onChange={onSortChange} />
      <DropdownPill value="More Filters" options={["More Filters"]} onChange={() => {}} />
    </div>
  );
}

export default function SearchFilters({
  price,
  onPriceChange,
  sort,
  onSortChange,
}: SearchFiltersProps) {
  return (
    <div className="content-stretch flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 lg:gap-27 items-center justify-center relative shrink-0 w-full">
      <Filters price={price} sort={sort} onPriceChange={onPriceChange} onSortChange={onSortChange} />
    </div>
  );
}
