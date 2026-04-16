"use client";

import { useState } from "react";
import Footer from "@/components/footer";
import BouquetCard from "@/components/BouquetCard";
import { Icon } from "@iconify/react";
import SearchBar from "@/components/SearchBar";
import { mockBouquets } from "@/lib/mockData";

// ─── Sort bouquets by sold_count descending ───────────────
const sortedBouquets = [...mockBouquets].sort((a, b) => b.sold_count - a.sold_count);

// ─── HEADLINE ─────────────────────────────────────────────
function Headline() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center relative shrink-0 text-center w-full">
      <div className="flex flex-col font-bold justify-center leading-[1.1] relative shrink-0 text-[#1f1f1f] text-[32px] sm:text-[48px] lg:text-[64px] tracking-[-0.64px]">
        <h2 className="block mb-0">Find flowers fast.</h2>
        <h2 className="block">Buy with confidence.</h2>
      </div>
      <div className="flex flex-col font-semibold justify-center leading-0 relative shrink-0 text-[#6f6a65] text-[18px] tracking-[-0.09px] w-full max-w-160">
        <p className="leading-normal whitespace-pre-wrap">Search bouquets, local florists, or special occasions—all in one place.</p>
      </div>
    </div>
  );
}

// ─── FILTERS ──────────────────────────────────────────────
function DropdownPill({ label }: { label: string }) {
  return (
    <div className="bg-white content-stretch flex gap-1.5 items-center px-3.5 py-2 relative rounded-2xl shrink-0 cursor-pointer hover:bg-[#f7f4ef] transition-colors">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-2xl" />
      <div className="flex flex-col font-normal justify-center leading-0 relative shrink-0 text-[#1f1f1f] text-[14px] text-center tracking-[-0.07px] whitespace-nowrap">
        <p className="leading-[1.45]">{label}</p>
      </div>
      <Icon icon="mdi:chevron-down" width={12} height={12} color="#1f1f1f" />
    </div>
  );
}

function Filters() {
  return (
    <div className="bg-[#f7f4ef] content-stretch flex flex-wrap gap-3 items-center justify-center relative rounded-2xl shrink-0 px-3 py-2">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-2xl" />
      <DropdownPill label="Price: Any" />
      <DropdownPill label="Sort by: Best Sellers" />
      <DropdownPill label="More Filters" />
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────
function Hero() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <Headline />
      <SearchBar />
      <Filters />
      <div className="bg-[#edeae6] h-px shrink-0 w-40" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-medium text-[#7a7a7a] text-[15px] tracking-[0.3px]">
          <span>Are you a local florist? </span>
          <a className="cursor-pointer font-bold text-[#2f5d3a]" href="/sign-up">
            Join BloomHero as a Vendor
          </a>
        </p>
        <p className="text-[#a8a39d] text-[13px]">
          You&apos;ll need to{" "}
          <a href="/sign-up" className="underline text-[#7a7a7a] hover:text-[#2f5d3a]">
            create a free account
          </a>{" "}
          first before applying as a vendor.
        </p>
      </div>
    </div>
  );
}

// ─── BEST SELLERS ─────────────────────────────────────────
function BestSellers() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <p className="font-medium text-[#8f8f8f] text-[12px] text-center tracking-[1.2px]">BEST SELLERS</p>
      <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[32px] text-center tracking-[1.28px] leading-[1.2]">
        Customer favorites, loved for any moment
      </p>
      <p className="font-normal text-[#7a7a7a] text-[16px] text-center tracking-[0.64px] w-full max-w-130">
        Popular flowers from trusted local florists.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row gap-4 justify-center overflow-clip relative shrink-0 w-full">
        {sortedBouquets.map((bouquet) => (
          <BouquetCard
            key={bouquet.id}
            image={bouquet.image_url}
            images={(bouquet as any).images}
            name={bouquet.name}
            price={bouquet.price}
            shop={bouquet.shop_name}
            distance={bouquet.distance}
            category={bouquet.category}
            rating={bouquet.rating}
            sold={bouquet.sold_count}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SHOP BY CATEGORY (now clickable) ─────────────────────
const categoryGroups = [
  {
    title: "CELEBRATIONS & MILESTONES",
    items: [
      { icon: "mdi:cake-variant-outline", label: "Birthday Blooms", href: "/search?category=birthday" },
      { icon: "mdi:school-outline", label: "Graduation Cheers", href: "/search?category=graduation" },
      { icon: "mdi:star-shooting-outline", label: "New Beginnings", href: "/search?category=new-beginnings" },
      { icon: "mdi:flower-outline", label: "Just Because", href: "/search?category=just-because" },
    ],
  },
  {
    title: "LOVE & RELATIONSHIPS",
    items: [
      { icon: "mdi:heart-outline", label: "Love Notes in Bloom", href: "/search?category=love" },
      { icon: "mdi:ring", label: "Anniversary Classics", href: "/search?category=anniversary" },
      { icon: "mdi:emoticon-sad-outline", label: `Say "I Miss You"`, href: "/search?category=miss-you" },
    ],
  },
  {
    title: "CARE & SUPPORT",
    items: [
      { icon: "mdi:medical-bag", label: "Get Well Soon", href: "/search?category=get-well" },
      { icon: "mdi:hand-heart-outline", label: "Thinking of You", href: "/search?category=thinking-of-you" },
      { icon: "mdi:hand-okay", label: "Gentle Comfort", href: "/search?category=comfort" },
    ],
  },
  {
    title: "EVERYDAY & SPECIALTY",
    items: [
      { icon: "mdi:leaf", label: "Plants That Last", href: "/search?category=plants" },
      { icon: "mdi:scissors-cutting", label: "Handcrafted", href: "/search?category=handcrafted" },
      { icon: "mdi:storefront-outline", label: "Florist's Picks", href: "/search?category=florist-picks" },
    ],
  },
  {
    title: "CUSTOM & FLEXIBLE",
    items: [
      { icon: "mdi:pencil-ruler-outline", label: "Build Your Own Bouquet", href: "/custom-bouquet" },
      { icon: "mdi:gift-outline", label: "Made Just for You", href: "/custom-bouquet" },
    ],
  },
];

function CategoryItem({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex gap-3 items-center group">
      <Icon icon={icon} width={24} height={24} color="#E05850" />
      <span className="font-normal text-[#2f5d3a] text-[16px] tracking-[1.28px] leading-5.5 group-hover:underline group-hover:text-[#1f3d26] transition-colors whitespace-nowrap">
        {label}
      </span>
    </a>
  );
}

function CategoryGroup({ title, items }: { title: string; items: { icon: string; label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="font-medium text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] leading-5.5">{title}</p>
      <div className="flex flex-col gap-3 items-start">
        {items.map((item) => (
          <CategoryItem key={item.label} icon={item.icon} label={item.label} href={item.href} />
        ))}
      </div>
    </div>
  );
}

function ShopByCategory() {
  return (
    <div className="relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <div className="flex flex-col gap-8 md:gap-12 items-center justify-center p-6 md:p-16 w-full">
        <p className="font-medium text-[#7a7a7a] text-[12px] text-center tracking-[0.96px]">SHOP BY CATEGORY</p>
        <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[36px] text-center tracking-[0.36px] leading-[1.2]">
          Pick a vibe. We&apos;ll handle the flowers.
        </p>
        <div className="flex flex-wrap gap-8 md:gap-12 items-start justify-center w-full">
          {categoryGroups.map((group) => (
            <CategoryGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────
export default function Desktop() {
  return (
    <div className="content-stretch flex flex-col items-start px-4 sm:px-8 lg:px-16 relative size-full">
      <Hero />
      <BestSellers />
      <ShopByCategory />
      <Footer />
    </div>
  );
}