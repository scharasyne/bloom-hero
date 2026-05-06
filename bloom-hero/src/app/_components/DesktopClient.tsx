"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Footer from "@/components/footer";
import BouquetCard from "@/components/BouquetCard";
import SearchBar from "@/components/SearchBar";
import { mockBouquets } from "@/lib/mockData";

const ALL_BOUQUETS = [...mockBouquets].sort((a, b) => b.sold_count - a.sold_count);
const MAX_VISIBLE = 6;

type Category = "All" | "Bouquets" | "Plants" | "Handcrafted";
const CATEGORIES: Category[] = ["All", "Bouquets", "Plants", "Handcrafted"];

function Headline() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center text-center w-full">
      <div className="flex flex-col font-bold leading-[1.1] text-[#1f1f1f] text-[32px] sm:text-[48px] lg:text-[64px] tracking-[-0.64px]">
        <h2 className="block mb-0">Find flowers fast.</h2>
        <h2 className="block">Buy with confidence.</h2>
      </div>
      <p className="font-semibold text-[#6f6a65] text-[16px] tracking-[-0.09px] max-w-xl leading-normal">
        Search bouquets, local florists, or special occasions—all in one place.
      </p>
    </div>
  );
}

function CategoryChips({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors whitespace-nowrap ${
            active === cat
              ? "bg-[#2f5d3a] text-white"
              : "bg-[#efeae4] text-[#1f1f1f] hover:bg-[#e2ddd6]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function DropdownPill({ label }: { label: string }) {
  return (
    <div className="flex gap-1.5 items-center px-2.5 py-1 cursor-pointer hover:bg-[#ede9e3] rounded-xl transition-colors">
      <p className="font-normal text-[#1f1f1f] text-[12px] whitespace-nowrap">{label}</p>
      <Icon icon="mdi:chevron-down" width={10} height={10} color="#1f1f1f" />
    </div>
  );
}

function Filters() {
  return (
    <div className="flex flex-wrap gap-1 items-center justify-center bg-[#f0ece6] rounded-2xl px-2 py-1.5">
      <DropdownPill label="Price: Any" />
      <div className="w-px h-4 bg-[#ddd8d0]" />
      <DropdownPill label="Sort by: Best Sellers" />
      <div className="w-px h-4 bg-[#ddd8d0]" />
      <DropdownPill label="More Filters" />
    </div>
  );
}

function Hero({ activeCategory, onCategoryChange }: { activeCategory: Category; onCategoryChange: (c: Category) => void }) {
  return (
    <div className="flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <Headline />
      <SearchBar />
      {/* <CategoryChips active={activeCategory} onChange={onCategoryChange} />
      <Filters /> */}
      <div className="bg-[#edeae6] h-px w-40" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="font-medium text-[#7a7a7a] text-[15px] tracking-[0.3px]">
          <span>Are you a local florist? </span>
          <a className="cursor-pointer font-bold text-[#2f5d3a]" href="/sign-up">
            Join BloomHero as a Vendor
          </a>
        </p>
      </div>
    </div>
  );
}

function BestSellers({ activeCategory }: { activeCategory: Category }) {
  const filtered = activeCategory === "All"
    ? ALL_BOUQUETS
    : ALL_BOUQUETS.filter((b) => b.category === activeCategory);

  const visible = filtered.slice(0, MAX_VISIBLE);

  return (
    <div className="flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />
      <p className="font-medium text-[#8f8f8f] text-[12px] text-center tracking-[1.2px]">BEST SELLERS</p>
      <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[32px] text-center tracking-[1.28px] leading-[1.2]">
        Customer favorites, loved for any moment
      </p>
      <p className="font-normal text-[#7a7a7a] text-[16px] text-center max-w-lg">
        Popular flowers from trusted local florists.
      </p>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
          {visible.map((bouquet) => (
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
      ) : (
        <p className="text-[#7a7a7a] text-[15px] py-8">No bouquets found in this category.</p>
      )}

      <Link
        href="/search"
        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#2f5d3a] text-[#2f5d3a] font-semibold text-[14px] hover:bg-[#eef4f0] transition-colors"
      >
        See More
        <Icon icon="mdi:arrow-right" width={16} height={16} />
      </Link>
    </div>
  );
}

const categoryGroups = [
  {
    title: "CELEBRATIONS & MILESTONES",
    items: [
      { icon: "mdi:cake-variant-outline", label: "Birthday Blooms", href: "/search?scope=flowers&category=birthday" },
      { icon: "mdi:school-outline", label: "Graduation Cheers", href: "/search?scope=flowers&category=graduation" },
      { icon: "mdi:star-shooting-outline", label: "New Beginnings", href: "/search?scope=flowers&category=new-beginnings" },
    ],
  },
  {
    title: "LOVE & RELATIONSHIPS",
    items: [
      { icon: "mdi:heart-outline", label: "Love Notes in Bloom", href: "/search?scope=flowers&category=love-notes" },
      { icon: "mdi:ring", label: "Anniversary Classics", href: "/search?scope=flowers&category=anniversary" },
      { icon: "mdi:emoticon-sad-outline", label: "Missing You", href: "/search?scope=flowers&category=missing-you" },
    ],
  },
  {
    title: "CARE & SUPPORT",
    items: [
      { icon: "mdi:medical-bag", label: "Get Well Soon", href: "/search?scope=flowers&category=get-well" },
      { icon: "mdi:hand-okay", label: "Gentle Comfort", href: "/search?scope=flowers&category=gentle-comfort" },
      { icon: "mdi:flower-outline", label: "In Loving Memory", href: "/search?scope=flowers&category=in-loving-memory" },
    ],
  },
  {
    title: "EVERYDAY & SPECIALTY",
    items: [
      { icon: "mdi:scissors-cutting", label: "Handcrafted", href: "/search?scope=flowers&category=handcrafted" },
      { icon: "mdi:gift-outline", label: "Just Because", href: "/search?scope=flowers&category=just-because" },
      { icon: "mdi:storefront-outline", label: "Florists' Picks", href: "/search?scope=flowers&category=florists-picks" },
    ],
  },
];

function CategoryItem({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex gap-3 items-center group">
      <Icon icon={icon} width={24} height={24} color="#d24b46" />
      <span className="font-normal text-[#2f5d3a] text-[16px] tracking-[1.28px] leading-5.5 group-hover:underline group-hover:text-[#1f3d26] transition-colors whitespace-nowrap">
        {label}
      </span>
    </a>
  );
}

function CategoryGroup({ title, items }: { title: string; items: { icon: string; label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="font-medium text-[#7a7a7a] text-[14px] text-center tracking-[0.28px] whitespace-nowrap">{title}</p>
      <div className="flex flex-col gap-3 items-center">
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
      <div
        aria-hidden="true"
        className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none"
      />
      <div className="flex flex-col gap-5 md:gap-8 items-center justify-center p-6 md:p-16 w-full max-w-6xl mx-auto">
        <p className="font-medium text-[#7a7a7a] text-[14px] text-center tracking-[0.96px]">
          SHOP BY CATEGORY
        </p>
        <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[36px] text-center tracking-[0.36px] leading-[1.2]">
          Pick a vibe. We&apos;ll handle the flowers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 w-full max-w-6xl mx-auto">
          {categoryGroups.map((group) => (
            <CategoryGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DesktopClient() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  return (
    <div className="content-stretch flex flex-col items-start px-4 sm:px-8 lg:px-16 relative size-full">
      <Hero activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <BestSellers activeCategory={activeCategory} />
      <ShopByCategory />
      <Footer />
    </div>
  );
}
