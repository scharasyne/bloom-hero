import { Icon } from "@iconify/react";
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
  onAddToCart,
  adding,
  onBuyNow,
  buying,
}: BouquetCardProps) {
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

  const locationLabel = `${shop} · ${distance}`;
  const hasRating = rating !== undefined && rating !== null;
  const hasSold   = sold   !== undefined && sold   !== null;

  return (
    <div className="group flex w-full max-w-[280px] flex-col overflow-hidden rounded-[22px] border border-[#edeae6] bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_12px_30px_0px_rgba(0,0,0,0.09)] lg:max-w-[288px]">
      <div className="relative aspect-[1/1] w-full overflow-hidden bg-[#f5f2ed]">
        {imageUrls.length > 0 ? (
          <ProductCardImageCarousel
            imageUrls={imageUrls}
            productName={name}
            imageClassName="absolute inset-0 size-full rounded-t-[22px] object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#c5bfb7]">
            <Icon icon="mdi:flower-outline" width={36} height={36} />
            <p className="text-[11px] font-medium tracking-wide">No photo yet</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-[1.35] text-[#1f1f1f] lg:text-[17px]">
            {name}
          </h3>
          <div className="shrink-0 text-right text-[16px] font-bold leading-none text-[#D24B46] lg:text-[18px]">
            ₱{price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#7a7a7a]">
          <Icon icon="mdi:storefront-outline" width={15} height={15} />
          <p className="text-[11px] font-medium leading-5 lg:text-[13px]">{locationLabel}</p>
        </div>

        {/* ── Category Pills ── */}
        {categoryPills.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categoryPills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center rounded-full border border-[#e6e1d8] bg-[#f3f0ea] px-2.5 py-1 text-[11px] font-medium tracking-[-0.065px] text-[#2f5d3a] lg:text-[13px] shrink-0"
              >
                {pill}
              </span>
            ))}
          </div>
        ) : null}

<<<<<<< filter-category
        {/* ── Rating ── */}
        <div className="min-h-[18px] lg:min-h-[20px]">
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
          ) : (
            <span aria-hidden="true" className="text-[11px] lg:text-[13px] text-transparent">
              No ratings yet
            </span>
          )}
        </div>

        {/* ── Actions ──
            FIX 3: Add to Cart is the full-width primary action.
            Buy Now is a quieter text link below it — reduces button heaviness.
        */}
        {(onAddToCart || onBuyNow) && (
  <div className="mt-2 flex flex-col gap-2 w-full">
    {/* Buy Now — primary solid pill (most urgent action) */}
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
    {/* Add to Cart — secondary outlined pill (low-commitment action) */}
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
=======
        {(hasRating || hasSold) && (
          <div className="flex items-center gap-2 text-[11px] lg:text-[13px]">
            {hasRating ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[#f4b400]">
                <span>★</span>
                <span>{rating?.toFixed(1)}</span>
              </span>
            ) : null}
            {hasSold ? (
              <span className="font-medium text-[#7a7a7a]">
                {hasRating ? "· " : ""}
                {sold} sold
              </span>
            ) : null}
            {!hasRating && !hasSold ? (
              <span className="font-medium text-[#b0a89e]">No ratings yet</span>
            ) : null}
          </div>
        )}
>>>>>>> main

        {(onBuyNow || onAddToCart) && (
          <div className="mt-1 flex flex-col gap-2">
            {onBuyNow && (
              <button
                type="button"
                onClick={onBuyNow}
                disabled={buying || adding}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d24b46] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b83d39] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="mdi:shopping-outline" width={15} height={15} />
                {buying ? "Processing..." : "Buy Now"}
              </button>
            )}
            {onAddToCart && (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={adding || buying}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d24b46] bg-white px-4 py-3 text-sm font-semibold text-[#d24b46] transition-colors hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="mdi:cart-outline" width={15} height={15} />
                {adding ? "Adding..." : "Add to Cart"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}