import { Icon } from "@iconify/react";


interface BouquetCardProps {
  image?: string | null;
  name: string;
  price: number;
  shop: string;
  distance: string;
  category: string;
  rating: number;
  sold: number;
  onAddToCart?: () => void;
  adding?: boolean;
  onBuyNow?: () => void;
  buying?: boolean;
}

export default function BouquetCard({
  image,
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
  return (
    <div className="bg-white content-stretch flex flex-col gap-3 items-start pb-6 relative rounded-[18px] shrink-0 w-full lg:w-70" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-45 lg:h-65 relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full bg-[#f5f2ed] overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={name}
            className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full"
            src={image}
          />
        ) : null}
      </div>
      <div className="content-stretch flex flex-col gap-1.5 items-start justify-center px-4 relative shrink-0 w-full">
        {/* Name & Price */}
        <div className="content-stretch flex items-start justify-between leading-0 relative shrink-0 text-center w-full">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[13px] lg:text-[18px] tracking-[-0.09px]">
            <p className="leading-[1.45]">{name}</p>
          </div>
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[14px] lg:text-[20px] tracking-[-0.1px]">
            <p className="leading-5.5">₱ {price}</p>
          </div>
        </div>
        {/* Shop & Distance */}
        <div className="content-stretch flex gap-1.5 items-center justify-center relative shrink-0">
          <Icon icon="mdi:map-marker-outline" width={15} height={15} color="#7a7a7a" />
          <p className="text-[#7a7a7a] text-[11px] lg:text-[13px] font-medium leading-5.5">{shop} · {distance}</p>
        </div>
        {/* Category Pill */}
        <div className="bg-[#f3f0ea] content-stretch flex flex-col h-6.5 items-center justify-center px-2.5 py-1 relative rounded-[999px] shrink-0">
          <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
          <p className="font-medium text-[#2f5d3a] text-[11px] lg:text-[13px] tracking-[-0.065px] leading-4">{category}</p>
        </div>
        {/* Rating */}
        <p className="text-[11px] lg:text-[13px] font-medium">
          <span className="text-[#f4b400]">★ </span>
          <span className="text-[#7a7a7a]">{rating} ({sold} sold)</span>
        </p>

        {(onAddToCart || onBuyNow) && (
          <div className="mt-2 flex gap-2 w-full">
            {onAddToCart && (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={adding || buying}
                className="flex-1 inline-flex items-center justify-center rounded-full bg-[#2f5d3a] px-3 py-1.5 text-xs lg:text-sm font-semibold text-white hover:bg-[#264a2f] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adding ? "Adding..." : "Add to cart"}
              </button>
            )}
            {onBuyNow && (
              <button
                type="button"
                onClick={onBuyNow}
                disabled={buying || adding}
                className="flex-1 inline-flex items-center justify-center rounded-full border border-[#2f5d3a] px-3 py-1.5 text-xs lg:text-sm font-semibold text-[#2f5d3a] bg-white hover:bg-[#f3faf6] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {buying ? "Processing..." : "Buy now"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
