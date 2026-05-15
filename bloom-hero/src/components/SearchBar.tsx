"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface SearchBarProps {
  initialQuery?: string;
  scope?: string;
  category?: string;
  onSearch?: () => void;
}

type SearchScope = "all" | "flowers" | "vendors" | "popups";
type SearchType = "All" | "Flowers" | "Vendors" | "Pop Ups";
const CATEGORY_VALUES = new Set([
  "graduation",
  "in-loving-memory",
  "new-beginnings",
  "love-notes",
  "handcrafted",
  "anniversary",
  "gentle-comfort",
  "birthday",
  "just-because",
  "missing-you",
  "get-well",
  "florists-picks",
]);
const searchTypes: SearchType[] = ["All", "Flowers", "Vendors", "Pop Ups"];
const placeholders: Record<SearchType, string> = {
  All: "Search bouquets, vendors, pop-ups, or occasions...",
  Flowers: "Search flowers or bouquets...",
  Vendors: "Search local florists or shops...",
  "Pop Ups": "Search pop-up locations or vendors...",
};

function scopeToType(scope?: string): SearchType {
  if (scope === "flowers") return "Flowers";
  if (scope === "vendors") return "Vendors";
  if (scope === "popups") return "Pop Ups";
  return "All";
}

function typeToScope(type: SearchType): SearchScope {
  if (type === "Flowers") return "flowers";
  if (type === "Vendors") return "vendors";
  if (type === "Pop Ups") return "popups";
  return "all";
}

export default function SearchBar({ initialQuery = "", scope, category, onSearch }: SearchBarProps) {
  const router = useRouter();
  const [term, setTerm] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(scopeToType(scope));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSearchType(scopeToType(scope));
  }, [scope]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.trim();
    const normalizedQuery = query.toLowerCase();
    const categoryFromQuery = CATEGORY_VALUES.has(normalizedQuery) ? normalizedQuery : null;
    onSearch?.();

    const params = new URLSearchParams();
    params.set("scope", typeToScope(searchType));
    if (query) {
      if (categoryFromQuery) {
        params.set("category", categoryFromQuery);
      } else {
        params.set("q", query);
      }
    } else if (category) {
      params.set("category", category);
    }

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center w-full">
      <div className="bg-white flex items-center h-14 relative rounded-[22px] w-full max-w-2xl shadow-[0px_4px_24px_0px_rgba(0,0,0,0.09)] border border-[#eae6e0]">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 pl-5 pr-3 h-14 text-[14px] font-semibold text-[#d24b46] hover:text-[#bb3f3a] transition-colors whitespace-nowrap rounded-l-[22px]"
          >
            {searchType}
            <Icon
              icon="mdi:chevron-down"
              width={14}
              height={14}
              className={"text-[#7a7a7a] transition-transform duration-200 " + (dropdownOpen ? "rotate-180" : "")}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-2xl shadow-[0px_8px_28px_rgba(0,0,0,0.10)] border border-[#eae6e0] py-1.5 z-50 min-w-[130px]">
              {searchTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSearchType(type);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[14px] transition-colors hover:bg-[#f5f1eb] rounded-lg ${
                    searchType === type ? "text-[#d24b46] font-semibold" : "text-[#1f1f1f] font-normal"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[#e0dbd3] shrink-0" />

        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholders[searchType]}
          className="flex-1 bg-transparent text-[15px] text-[#1f1f1f] placeholder-[#b5aea7] outline-none px-4"
        />

        <button
          type="submit"
          className="bg-[#d24b46] hover:bg-[#bb3f3a] active:bg-[#822C28] transition-colors flex items-center justify-center shrink-0 h-[46px] w-[46px] rounded-[18px] mr-[5px]"
          aria-label="Search"
        >
          <Icon icon="mdi:magnify" width={20} height={20} color="white" />
        </button>
      </div>
    </form>
  );
}