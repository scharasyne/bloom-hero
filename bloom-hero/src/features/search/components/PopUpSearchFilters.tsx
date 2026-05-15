"use client";

import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import {
  POPUP_CITY_OPTIONS,
  POPUP_SORT_OPTIONS,
  POPUP_TIMING_OPTIONS,
  type PopUpSort,
  type PopUpTiming,
} from "@/features/search/utils/popupFilters";

function FilterPill({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={
          "flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-all " +
          (active
            ? "border-[#2f5d3a] bg-[#2f5d3a] text-white"
            : "border-[#e0dbd3] bg-white text-[#1f1f1f] hover:border-[#c5bfb7] hover:bg-[#faf8f5]")
        }
      >
        {label}
        <Icon icon="mdi:chevron-down" width={14} height={14} color={active ? "white" : "#7a7a7a"} />
      </button>
      <div className="absolute left-0 top-full z-20 mt-1.5 hidden min-w-[180px] rounded-2xl border border-[#e5e0d8] bg-white py-1.5 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] group-focus-within:block">
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
      className={
        "mx-auto flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2 text-left text-[13px] transition-colors hover:bg-[#f5f2ed] " +
        (selected ? "font-semibold text-[#d24b46]" : "text-[#1f1f1f]")
      }
    >
      {label}
      {selected ? <Icon icon="mdi:check" width={14} height={14} color="#d24b46" /> : null}
    </button>
  );
}

type PopUpSearchFiltersProps = {
  city: string;
  onCityChange: (value: string) => void;
  timing: PopUpTiming;
  onTimingChange: (value: PopUpTiming) => void;
  sort: PopUpSort;
  onSortChange: (value: PopUpSort) => void;
};

export default function PopUpSearchFilters({
  city,
  onCityChange,
  timing,
  onTimingChange,
  sort,
  onSortChange,
}: PopUpSearchFiltersProps) {
  const timingLabel = POPUP_TIMING_OPTIONS.find((option) => option.value === timing)?.label ?? "Upcoming";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <FilterPill label={city === "Any" ? "City" : city} active={city !== "Any"}>
        {POPUP_CITY_OPTIONS.map((option) => (
          <DropdownItem
            key={option}
            label={option}
            selected={city === option}
            onClick={() => onCityChange(option)}
          />
        ))}
      </FilterPill>

      <FilterPill label={timingLabel} active={timing !== "upcoming"}>
        {POPUP_TIMING_OPTIONS.map((option) => (
          <DropdownItem
            key={option.value}
            label={option.label}
            selected={timing === option.value}
            onClick={() => onTimingChange(option.value)}
          />
        ))}
      </FilterPill>

      <FilterPill label={sort} active={sort !== "Earliest"}>
        {POPUP_SORT_OPTIONS.map((option) => (
          <DropdownItem
            key={option}
            label={option}
            selected={sort === option}
            onClick={() => onSortChange(option)}
          />
        ))}
      </FilterPill>
    </div>
  );
}
