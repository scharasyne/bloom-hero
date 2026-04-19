"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface BouquetCardProps {
  image?: string | null;
  images?: string[];       // NEW: multiple photos
  name: string;
  price: number;
  shop: string;
  distance: string;
  category: string;
  rating?: number;
  sold?: number;
  onAddToCart?: () => void;
  adding?: boolean;
  onBuyNow?: () => void;
  buying?: boolean;
}

export default function BouquetCard({
  image,
  images,
  name,
  price,
  shop,
  distance,
  category,
  rating,
  sold,
  onAddToCart,
  adding,
  onBuyNow,
  buying,
}: BouquetCardProps) {
  // Build the photo list: prefer `images` array, fall back to single `image`
  const photos = images && images.length > 0
    ? images
    : image
    ? [image]
    : [];

  const [photoIdx, setPhotoIdx] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i + 1) % photos.length);
  };

  return (
    <div
      className="bg-white content-stretch flex flex-col gap-3 items-start pb-6 relative rounded-[18px] shrink-0 w-full lg:w-70"
      data-name="Bouquet Card"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]"
      />

      {/* ── Product Image (swipeable) ── */}
      <div className="h-45 lg:h-65 relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full bg-[#f5f2ed] overflow-hidden group">
        {photos.length > 0 ? (
          <>
            <img
              alt={name}
              className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full transition-opacity duration-300"
              src={photos[photoIdx]}
            />

            {/* Prev / Next — only if multiple photos */}
            {photos.length > 1 && (
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
                  {photos.map((_, i) => (
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
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#c5bfb7]">
            <Icon icon="mdi:flower-outline" width={36} height={36} />
            <p className="text-[11px] font-medium tracking-wide">No photo yet</p>
          </div>
        )}
      </div>

      <div className="content-stretch flex flex-col gap-1.5 items-start justify-center px-4 relative shrink-0 w-full">

        {/* ── Name & Price ── */}
        <div className="content-stretch flex items-start justify-between leading-0 relative shrink-0 text-center w-full">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[13px] lg:text-[18px] tracking-[-0.09px]">
            <p className="leading-[1.45]">{name}</p>
          </div>
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[14px] lg:text-[20px] tracking-[-0.1px]">
            <p className="leading-5.5">₱ {price}</p>
          </div>
        </div>

        {/* ── Shop & Distance ── */}
        <div className="content-stretch flex gap-1.5 items-center justify-center relative shrink-0">
          <Icon icon="mdi:map-marker-outline" width={15} height={15} color="#7a7a7a" />
          <p className="text-[#7a7a7a] text-[11px] lg:text-[13px] font-medium leading-5.5">
            {shop} · {distance}
          </p>
        </div>

        {/* ── Category Pill ── */}
        <div className="bg-[#f3f0ea] content-stretch flex flex-col h-6.5 items-center justify-center px-2.5 py-1 relative rounded-[999px] shrink-0">
          <div
            aria-hidden="true"
            className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]"
          />
          <p className="font-medium text-[#2f5d3a] text-[11px] lg:text-[13px] tracking-[-0.065px] leading-4">
            {category}
          </p>
        </div>

        {/* ── Rating ── */}
        {rating && rating > 0 ? (
          <p className="text-[11px] lg:text-[13px] font-medium">
            <span className="text-[#f4b400]">★ </span>
            <span className="text-[#7a7a7a]">
              {rating}{sold !== undefined ? ` (${sold} sold)` : ""}
            </span>
          </p>
        ) : sold && sold > 0 ? (
          <p className="text-[11px] lg:text-[13px] font-medium text-[#b0a89e]">
            {sold} sold · No ratings yet
          </p>
        ) : null}

        {/* ── Actions ── */}
        {(onAddToCart || onBuyNow) && (
          <div className="mt-2 flex flex-col gap-2 w-full">
            {onBuyNow && (
              <button
                type="button"
                onClick={onBuyNow}
                disabled={buying || adding}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#d24b46] px-3 py-2 text-xs lg:text-sm font-semibold text-white hover:bg-[#b83d39] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="mdi:shopping-outline" width={14} height={14} />
                {buying ? "Processing..." : "Buy Now"}
              </button>
            )}
            {onAddToCart && (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={adding || buying}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d24b46] px-3 py-2 text-xs lg:text-sm font-semibold text-[#d24b46] bg-white hover:bg-[#fff5f5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="mdi:cart-outline" width={14} height={14} />
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}