import { Icon } from "@iconify/react";


interface BouquetCardProps {
  image: string;
  name: string;
  price: number;
  shop: string;
  distance: string;
  category: string;
  rating: number;
  sold: number;
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
}: BouquetCardProps) {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start pb-[24px] relative rounded-[18px] shrink-0 w-full lg:w-[280px]" data-name="Bouquet Card">
      <div aria-hidden="true" className="absolute border border-[#edeae6] border-solid inset-0 pointer-events-none rounded-[18px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]" />
      <div className="h-[180px] lg:h-[260px] relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full">
        <img alt={name} className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[18px] rounded-tr-[18px] size-full" src={image} />
      </div>
      <div className="content-stretch flex flex-col gap-[6px] items-start justify-center px-[16px] relative shrink-0 w-full">
        {/* Name & Price */}
        <div className="content-stretch flex items-start justify-between leading-[0] relative shrink-0 text-center w-full">
          <div className="flex flex-col font-semibold justify-center relative shrink-0 text-[#1f1f1f] text-[13px] lg:text-[18px] tracking-[-0.09px]">
            <p className="leading-[1.45]">{name}</p>
          </div>
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#2f5d3a] text-[14px] lg:text-[20px] tracking-[-0.1px]">
            <p className="leading-[22px]">₱ {price}</p>
          </div>
        </div>
        {/* Shop & Distance */}
        <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0">
          <Icon icon="mdi:map-marker-outline" width={15} height={15} color="#7a7a7a" />
          <p className="text-[#7a7a7a] text-[11px] lg:text-[13px] font-medium leading-[22px]">{shop} · {distance}</p>
        </div>
        {/* Category Pill */}
        <div className="bg-[#f3f0ea] content-stretch flex flex-col h-[26px] items-center justify-center px-[10px] py-[4px] relative rounded-[999px] shrink-0">
          <div aria-hidden="true" className="absolute border border-[#e6e1d8] border-solid inset-0 pointer-events-none rounded-[999px]" />
          <p className="font-medium text-[#2f5d3a] text-[11px] lg:text-[13px] tracking-[-0.065px] leading-[16px]">{category}</p>
        </div>
        {/* Rating */}
        <p className="text-[11px] lg:text-[13px] font-medium">
          <span className="text-[#f4b400]">★ </span>
          <span className="text-[#7a7a7a]">{rating} ({sold} sold)</span>
        </p>
      </div>
    </div>
  );
}
