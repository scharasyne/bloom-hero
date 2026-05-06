import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import ProductCardImageCarousel from "@/components/ProductCardImageCarousel";

interface BouquetCardProps {
  image?: string | null;
  images?: string[];
  name: string;
  price: number;
  shop: string;
  distance: string;
  category?: string;
  categories?: string[];
  rating?: number;        // optional — undefined = hide rating row
  sold?: number;          // optional — undefined = hide sold count
  href?: string;
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
  categories,
  rating,
  sold,
  href,
  onAddToCart,
  adding,
  onBuyNow,
  buying,
}: BouquetCardProps) {
  const router = useRouter();
  const normalizedImages = (images ?? []).filter(
    (url) => typeof url === "string" && url.trim().length > 0
  );
  const imageUrls =
    normalizedImages.length > 0
      ? normalizedImages
      : image
      ? [image]
      : [];
  const categoryPills = (categories && categories.length > 0 ? categories : category ? [category] : [])
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const handleImageClick = () => {
    if (!href) return;
    router.push(href);
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

      {/* ── Product Image ── */}
      <div
        className={`h-45 lg:h-65 relative rounded-tl-[18px] rounded-tr-[18px] shrink-0 w-full bg-[#f5f2ed] overflow-hidden ${href ? "cursor-pointer" : ""}`}
        onClick={handleImageClick}
        role={href ? "link" : undefined}
        tabIndex={href ? 0 : undefined}
        onKeyDown={(e) => {
          if (!href) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(href);
          }
        }}
      >
        {imageUrls.length > 0 ? (
          <ProductCardImageCarousel
            imageUrls={imageUrls}
            productName={name}
            imageClassName="absolute inset-0 max-w-none object-cover rounded-tl-[18px] rounded-tr-[18px] size-full"
          />
        ) : (
          /* FIX 1: Proper fallback when no product image exists */
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

        {/* ── Category Pills ── */}
        {categoryPills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categoryPills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center rounded-full border border-[#e6e1d8] bg-[#f3f0ea] px-2.5 py-1 text-[11px] font-medium tracking-[-0.065px] text-[#2f5d3a] lg:text-[13px]"
              >
                {pill}
              </span>
            ))}
          </div>
        ) : null}

        {/* ── Rating ── 
            FIX 2: Only render if rating is a real positive number.
            Shows "No ratings yet" as a soft label when sold > 0 but no rating exists.
        */}
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

        {/* ── Actions ──
            FIX 3: Add to Cart is the full-width primary action.
            Buy Now is a quieter text link below it — reduces button heaviness.
        */}
        {(onAddToCart || onBuyNow) && (
  <div className="mt-2 flex flex-col gap-2 w-full">
    {onAddToCart && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart();
        }}
        disabled={adding || buying}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d24b46] px-3 py-2 text-xs lg:text-sm font-semibold text-[#d24b46] bg-white hover:bg-[#fff5f5] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <Icon icon="mdi:cart-outline" width={14} height={14} />
        {adding ? "Adding..." : "Add to Cart"}
      </button>
    )}
    {onBuyNow && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onBuyNow();
        }}
        disabled={buying || adding}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#d24b46] px-3 py-2 text-xs lg:text-sm font-semibold text-white hover:bg-[#b83d39] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <Icon icon="mdi:shopping-outline" width={14} height={14} />
        {buying ? "Processing..." : "Buy Now"}
      </button>
    )}
    
  </div>
)}

      </div>
    </div>
  );
}