"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface BouquetCardProps {
  image?: string | null;
  images?: string[];
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
  image, images, name, price, shop, distance,
  category, rating, sold, onAddToCart, adding, onBuyNow, buying,
}: BouquetCardProps) {
  const photos = images && images.length > 0 ? images : image ? [image] : [];
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
    <div className="bg-white flex flex-col relative rounded-3xl w-full overflow-hidden shadow-[0px_2px_12px_0px_rgba(0,0,0,0.07)] border border-[#f0ece6] transition-shadow hover:shadow-[0px_4px_20px_0px_rgba(0,0,0,0.11)]">

      {/* Image — fixed height like original */}
      <div className="h-45 lg:h-65 relative rounded-tl-3xl rounded-tr-3xl shrink-0 w-full bg-[#f5f2ed] overflow-hidden group">
        {photos.length > 0 ? (
          <>
            <img
              alt={name}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-[1.03]"
              src={photos[photoIdx]}
            />
            {photos.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous">
                  <Icon icon="mdi:chevron-left" width={16} height={16} />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
                  <Icon icon="mdi:chevron-right" width={16} height={16} />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
                      className={`h-1.5 rounded-full transition-all ${i === photoIdx ? "bg-white w-3" : "bg-white/50 w-1.5"}`}
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

      {/* Info — original layout */}
      <div className="flex flex-col gap-1.5 px-4 pt-3.5 pb-5">

        {/* Name + Price */}
        <div className="flex items-start justify-between">
          <p className="font-semibold text-[#1f1f1f] text-[13px] lg:text-[18px] leading-snug flex-1">{name}</p>
          <p className="font-bold text-[#2f5d3a] text-[14px] lg:text-[20px] shrink-0 leading-snug">₱{price.toLocaleString()}</p>
        </div>

        {/* Shop + Distance */}
        <div className="flex items-center gap-1.5">
          <Icon icon="mdi:map-marker-outline" width={13} height={13} color="#7a7a7a" />
          <p className="text-[#7a7a7a] text-[11px] lg:text-[13px] font-medium">{shop}{distance ? ` · ${distance}` : ""}</p>
        </div>

        {/* Category pill */}
        {category && (
          <div className="self-start bg-[#f3f0ea] border border-[#e6e1d8] px-2.5 py-0.5 rounded-full mt-0.5">
            <p className="font-medium text-[#2f5d3a] text-[11px] lg:text-[13px] tracking-[-0.065px]">{category}</p>
          </div>
        )}

        {/* Rating */}
        {rating && rating > 0 ? (
          <p className="text-[11px] lg:text-[13px] font-medium">
            <span className="text-[#f4b400]">★ </span>
            <span className="text-[#7a7a7a]">{rating}{sold !== undefined ? ` (${sold} sold)` : ""}</span>
          </p>
        ) : sold && sold > 0 ? (
          <p className="text-[11px] lg:text-[13px] font-medium text-[#b0a89e]">{sold} sold · No ratings yet</p>
        ) : null}

        {/* Actions — new button style */}
        {(onAddToCart || onBuyNow) && (
          <div className="flex gap-2 mt-2">
            {onAddToCart && (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={adding || buying}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d24b46] px-3 py-2.5 text-[13px] font-semibold text-[#d24b46] bg-white hover:bg-[#fff5f5] active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                <Icon icon="mdi:cart-outline" width={14} height={14} />
                {adding ? "Adding…" : "Add to Cart"}
              </button>
            )}
            {onBuyNow && (
              <button
                type="button"
                onClick={onBuyNow}
                disabled={buying || adding}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#d24b46] px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-[#b83d39] active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                <Icon icon="mdi:shopping-outline" width={14} height={14} />
                {buying ? "Processing…" : "Buy Now"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}