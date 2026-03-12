"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface SearchBarProps {
  initialQuery?: string;
}

function SearchButton() {
  return (
    <Link href="/search">
      <div className="bg-[#2f6b4f] content-stretch flex h-13.75 items-center justify-center px-4.5 py-3 relative rounded-br-[24px] rounded-tr-[24px] shrink-0 w-21">
        <Icon icon="mdi:magnify" width={28} height={28} color="white" />
      </div>
    </Link>
  );
}

function Location() {
  return (
    <div className="bg-[#f6f2ee] content-stretch flex gap-1.25 items-center px-3.5 py-2.5 relative rounded-[14px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Icon icon="mdi:map-marker" width={20} height={20} color="#2f5d3a" />
      <div className="flex flex-col font-semibold justify-center leading-0 relative shrink-0 text-[#1f1f1f] text-[16px] text-center tracking-[-0.08px] whitespace-nowrap">
        <p className="leading-normal">Cebu City</p>
      </div>
    </div>
  );
}


export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const [term, setTerm] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.trim();
    router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center w-full">
      <div className="bg-white content-stretch flex h-14.25 items-center justify-between pl-4 py-4 relative rounded-[24px] w-full max-w-240">
        <div
          aria-hidden="true"
          className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.1)]"
        />
        <Location />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search bouquets, vendors, or occasions…"
          className="flex-1 bg-transparent text-[16px] text-[#1f1f1f] placeholder-[#9a948f] outline-none px-2"
        />
        <SearchButton />
      </div>
    </form>
  );
}
