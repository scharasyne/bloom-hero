"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Category = "All" | "Bouquets" | "Plants" | "Handcrafted";

interface Bouquet {
  id: number;
  name: string;
  price: number;
  shop_name: string;
  distance: string;
  category: string;
  rating: number;
  sold_count: number;
  tags: string[]; // e.g. ["Birthday", "All-occasion"]
  images: string[]; // multiple photos
}

// ─────────────────────────────────────────────
// MOCK DATA (replace with real data source)
// ─────────────────────────────────────────────
const mockBouquets: Bouquet[] = [
  {
    id: 1,
    name: "Sunrise Bliss",
    price: 1200,
    shop_name: "Petal & Co.",
    distance: "1.2 km",
    category: "Bouquets",
    rating: 4.9,
    sold_count: 312,
    tags: ["Birthday", "All-occasion"],
    images: [
      "https://images.unsplash.com/photo-1487530811015-780a8f7e2a90?w=400&q=80",
      "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&q=80",
      "https://images.unsplash.com/photo-1490750967868-88df5691cc0e?w=400&q=80",
    ],
  },
  {
    id: 2,
    name: "Lavender Dreams",
    price: 950,
    shop_name: "Bloom Studio",
    distance: "0.8 km",
    category: "Bouquets",
    rating: 4.8,
    sold_count: 278,
    tags: ["Anniversary", "Love"],
    images: [
      "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=400&q=80",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80",
    ],
  },
  {
    id: 3,
    name: "Tropical Fiesta",
    price: 1450,
    shop_name: "Flora House",
    distance: "2.1 km",
    category: "Plants",
    rating: 4.7,
    sold_count: 198,
    tags: ["Birthday", "Just Because"],
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400&q=80",
    ],
  },
  {
    id: 4,
    name: "Rustic Charm",
    price: 1100,
    shop_name: "Wild Stems",
    distance: "3.0 km",
    category: "Handcrafted",
    rating: 4.9,
    sold_count: 341,
    tags: ["All-occasion", "Handcrafted"],
    images: [
      "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    ],
  },
];

// ─────────────────────────────────────────────
// TAG PILL
// ─────────────────────────────────────────────
function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eef4f0] text-[#2f5d3a] text-[11px] font-medium tracking-wide">
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// BOUQUET CARD  (swipeable photos + 2 tags)
// ─────────────────────────────────────────────
function BouquetCard({ bouquet }: { bouquet: Bouquet }) {
  const [photoIdx, setPhotoIdx] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i - 1 + bouquet.images.length) % bouquet.images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i + 1) % bouquet.images.length);
  };

  const displayTags = bouquet.tags.slice(0, 2);

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col w-56 shadow-sm border border-[#edeae6]">
      {/* Photo area */}
      <div className="relative w-full aspect-[4/3] bg-[#f5f1ec] overflow-hidden group">
        <img
          src={bouquet.images[photoIdx]}
          alt={bouquet.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Prev / Next arrows — show on hover or if multiple images */}
        {bouquet.images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
              aria-label="Previous photo"
            >
              <Icon icon="mdi:chevron-left" width={16} height={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
              aria-label="Next photo"
            >
              <Icon icon="mdi:chevron-right" width={16} height={16} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {bouquet.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === photoIdx ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Tags row */}
        <div className="flex flex-wrap gap-1">
          {displayTags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>

        <div className="font-semibold text-[#1f1f1f] text-[14px] leading-snug">
          {bouquet.name}
        </div>

        <div className="text-[#7a7a7a] text-[12px]">{bouquet.shop_name} · {bouquet.distance}</div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-[#2f5d3a] text-[15px]">₱{bouquet.price.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[12px] text-[#7a7a7a]">
            <Icon icon="mdi:star" width={13} height={13} color="#f59e0b" />
            <span>{bouquet.rating}</span>
            <span className="text-[#c0bab3]">·</span>
            <span>{bouquet.sold_count} sold</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY CHIPS  (now stateful + filterable)
// ─────────────────────────────────────────────
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`content-stretch flex items-center justify-center px-3.5 py-2 relative rounded-[999px] shrink-0 transition-colors cursor-pointer ${
        active ? "bg-[#2f5d3a]" : "bg-[#efeae4] hover:bg-[#e2ddd6]"
      }`}
    >
      <span
        className={`font-medium text-[14px] tracking-[-0.07px] whitespace-nowrap ${
          active ? "text-white" : "text-[#1f1f1f]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// BEST SELLERS SECTION  (with filtering + See More)
// ─────────────────────────────────────────────
const CATEGORIES: Category[] = ["All", "Bouquets", "Plants", "Handcrafted"];
const INITIAL_VISIBLE = 4;

export function BestSellers() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [showAll, setShowAll] = useState(false);

  // Sort by sold_count descending (frequency of orders)
  const sorted = [...mockBouquets].sort((a, b) => b.sold_count - a.sold_count);

  const filtered =
    activeCategory === "All"
      ? sorted
      : sorted.filter((b) => b.category === activeCategory);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-center py-8 md:py-16 relative shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#edeae6] border-b border-solid inset-[0_0_-0.5px_0] pointer-events-none" />

      {/* Section header */}
      <p className="font-medium text-[#8f8f8f] text-[12px] text-center tracking-[1.2px] uppercase">
        Best Sellers
      </p>
      <p className="font-semibold text-[#1f1f1f] text-[24px] md:text-[32px] text-center tracking-tight leading-snug">
        Customer favorites, loved for any moment
      </p>
      <p className="font-normal text-[#7a7a7a] text-[16px] text-center max-w-[32rem]">
        Popular flowers from trusted local florists, sorted by most ordered.
      </p>

      {/* Category chips — NOW FUNCTIONAL */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => { setActiveCategory(cat); setShowAll(false); }}
          />
        ))}
      </div>

      {/* Bouquet grid */}
      {visible.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4 w-full">
          {visible.map((bouquet) => (
            <BouquetCard key={bouquet.id} bouquet={bouquet} />
          ))}
        </div>
      ) : (
        <p className="text-[#7a7a7a] text-[15px] py-8">No bouquets found in this category.</p>
      )}

      {/* See More / See Less */}
      {filtered.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#2f5d3a] text-[#2f5d3a] font-semibold text-[14px] hover:bg-[#eef4f0] transition-colors"
        >
          {showAll ? "See Less" : `See More (${filtered.length - INITIAL_VISIBLE} more)`}
          <Icon icon={showAll ? "mdi:chevron-up" : "mdi:chevron-down"} width={16} height={16} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// UPDATED "JOIN AS VENDOR" BLURB
// ─────────────────────────────────────────────
export function VendorBlurb() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="font-medium text-[#7a7a7a] text-[15px] tracking-[0.3px]">
        <span>Are you a local florist? </span>
        <a className="cursor-pointer font-bold text-[#2f5d3a]" href="/sign-up">
          Join BloomHero as a Vendor
        </a>
      </p>
      {/* NEW: clarifying note */}
      <p className="text-[#a8a39d] text-[13px]">
        You&apos;ll need to{" "}
        <a href="/sign-up" className="underline text-[#7a7a7a] hover:text-[#2f5d3a]">
          create a free account
        </a>{" "}
        first before applying as a vendor.
      </p>
    </div>
  );
}