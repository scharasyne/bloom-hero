"use client";

// Source: `src/app/(customer)/_components/product-detail-layout.tsx` (product detail shell; reviews UI moved to `ProductDetailReviewsSection`)

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { ProductDetailRow } from "@/features/products/types";
import type { ProductReviewRow } from "@/features/reviews/types";
import { addToCart } from "@/features/orders/actions/addToCart";
import { ProductDetailReviewsSection } from "@/features/reviews/components/ProductDetailReviewsSection";

function MainPicture({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] shrink-0 overflow-hidden rounded-2xl bg-[#f4f0eb] sm:rounded-[24px]">
      <img alt={alt} className="size-full object-cover pointer-events-none" src={src} />
    </div>
  );
}

function ChevronButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      className="flex shrink-0 items-center justify-center text-[#5f5f5f] transition hover:text-[#D24B46]"
    >
      <span className="text-3xl leading-none sm:text-[40px]">{direction === "left" ? "‹" : "›"}</span>
    </button>
  );
}

function GalleryDots({ currentIndex, totalItems, onDotClick }: { currentIndex: number; totalItems: number; onDotClick: (index: number) => void }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {Array.from({ length: totalItems }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`size-2.5 rounded-full transition ${
            index === currentIndex ? "bg-[#D24B46]" : "bg-[#d9d4cd] hover:bg-[#e6d4cf]"
          }`}
          aria-label={`Go to image ${index + 1}`}
        />
      ))}
    </div>
  );
}

function Thumbnail({ src, alt, active = false, onClick }: { src: string; alt: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`size-[72px] shrink-0 cursor-pointer overflow-hidden rounded-xl border transition sm:size-[96px] sm:rounded-[16px] lg:size-[116px] ${
        active ? "border-[#D24B46] ring-2 ring-[#D24B46]/20" : "border-transparent hover:border-[#d9d4cd]"
      }`}
    >
      <img alt={alt} className="size-full object-cover pointer-events-none" src={src} />
    </button>
  );
}

function Gallery({ product }: { product: ProductDetailRow | null }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageUrls = (product?.product_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => p.image_url)
    .filter((u) => typeof u === "string" && u.trim().length > 0);

  if (product?.product_image_url && imageUrls.length === 0) {
    imageUrls.push(product.product_image_url);
  }

  const total = Math.max(1, imageUrls.length);

  const handlePrevious = () => setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  const handleDotClick = (index: number) => setCurrentIndex(index);
  const handleThumbnailClick = (index: number) => setCurrentIndex(index);

  const mainSrc = imageUrls[currentIndex] ?? imageUrls[0] ?? "/bloom-icon.png";

  return (
    <div className="flex w-full max-w-[560px] flex-col items-center">
      <MainPicture src={mainSrc} alt={product?.product_name ?? "Product"} />

      <div className="mt-3 flex w-full items-center gap-2 sm:mt-4 sm:gap-3">
        <ChevronButton direction="left" onClick={handlePrevious} />

        <div className="scrollbar-thin-oval flex min-w-0 flex-1 gap-2 overflow-x-auto px-0.5 sm:gap-3">
          {imageUrls.slice(0, 4).map((src, index) => (
            <Thumbnail
              key={src + index}
              src={src}
              alt={product?.product_name ?? `Image ${index + 1}`}
              active={index === currentIndex}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>

        <ChevronButton direction="right" onClick={handleNext} />
      </div>

      <GalleryDots currentIndex={currentIndex} totalItems={total} onDotClick={handleDotClick} />
    </div>
  );
}

function Headline({ product, reviewCount, reviews }: { product: ProductDetailRow | null; reviewCount: number; reviews?: ProductReviewRow[] }) {
  const revs = reviews ?? [];
  const averageRating = revs.length > 0
    ? revs.reduce((sum, review) => sum + review.rating, 0) / revs.length
    : null;
  const safeRating = Math.max(0, Math.min(5, Math.round(averageRating ?? 0)));

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold leading-tight text-[#1f1f1f] sm:text-3xl lg:text-[36px]">
        {product?.product_name ?? "Product"}
      </h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 text-sm sm:text-base">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={index < safeRating ? "text-[#f4b740]" : "text-[#d9d4cd]"}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-[#1f1f1f] sm:text-base">
            {averageRating !== null ? Number(averageRating).toFixed(1) : "—"}
          </span>
        </div>
        <span className="text-sm text-[#6b6b6b] sm:text-base">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      </div>
      <div className="flex items-start gap-1 text-sm text-[#6b6b6b] sm:text-base">
        <Icon icon="mdi:map-marker-outline" className="mt-0.5 size-5 shrink-0" />
        <span className="min-w-0 break-words">{product?.shop_name ?? "Unknown vendor"}</span>
      </div>
    </div>
  );
}

function Tags({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(categories.length > 0 ? categories : ["Uncategorized"]).map((category) => (
        <span key={category} className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
          {category}
        </span>
      ))}
    </div>
  );
}

function PriceStock({ product }: { product: ProductDetailRow | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <strong className="text-xl font-semibold text-[#2f5d3a] sm:text-2xl">₱{product?.price ?? "—"}</strong>
      <div className="flex items-center gap-1.5 rounded-full bg-[#2f5d3a] px-3 py-1.5 sm:px-3 sm:py-1.5">
        <Icon icon="mdi:check" className="size-[18px] shrink-0 text-white" />
        <span className="text-xs font-medium text-white sm:text-sm">
          In Stock ({product?.stocks ?? 0} available)
        </span>
      </div>
    </div>
  );
}

function Quantity({ quantity, onQuantityChange }: { quantity: number; onQuantityChange: (q: number) => void }) {
  const handleIncrement = () => onQuantityChange(quantity + 1);
  const handleDecrement = () => {
    if (quantity > 1) onQuantityChange(quantity - 1);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-[#1f1f1f] sm:text-base">Quantity:</span>
      <div className="flex items-center rounded-full border border-[#edeae6] bg-white">
        <button
          type="button"
          onClick={handleDecrement}
          className="px-3 py-2 text-lg text-[#1f1f1f] transition hover:text-[#D24B46] sm:px-4"
        >
          −
        </button>
        <span className="min-w-10 px-3 text-center text-sm text-[#1f1f1f] sm:text-base">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          className="px-3 py-2 text-lg text-[#1f1f1f] transition hover:text-[#D24B46] sm:px-4"
        >
          +
        </button>
      </div>
    </div>
  );
}

function AddToCartButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#e6e1dc] px-5 py-3 text-sm font-semibold text-[#D24B46] transition hover:border-[#D24B46] hover:bg-[#fff5f3] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
    >
      <Icon icon="mdi:cart-outline" className="size-[20px]" />
      {loading ? "Adding..." : "Add to cart"}
    </button>
  );
}

function BuyNow({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D24B46] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b03d33] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
    >
      <Icon icon="mdi:shopping-outline" className="size-[20px] text-white shrink-0" />
      {loading ? "Processing..." : "Buy now"}
    </button>
  );
}

function Cta({ onAddToCart, onBuyNow, addingLoading, buyingLoading }: { onAddToCart: () => void; onBuyNow: () => void; addingLoading: boolean; buyingLoading: boolean }) {
  return (
    <div className="flex flex-col gap-3 pt-2 w-full">
      <AddToCartButton onClick={onAddToCart} loading={addingLoading} />
      <BuyNow onClick={onBuyNow} loading={buyingLoading} />
    </div>
  );
}

function Text({ product, reviewCount, quantity, onQuantityChange, onAddToCart, onBuyNow, addingLoading, buyingLoading, reviews }: { product: ProductDetailRow | null; reviewCount: number; quantity: number; onQuantityChange: (q: number) => void; onAddToCart: () => void; onBuyNow: () => void; addingLoading: boolean; buyingLoading: boolean; reviews?: ProductReviewRow[] }) {
  const categories = product?.categories ?? [];

  return (
    <div className="flex w-full min-w-0 max-w-[560px] flex-col gap-6 sm:gap-8 lg:flex-1">
      <Headline product={product} reviewCount={reviewCount} reviews={reviews} />
      <Tags categories={categories} />
      <PriceStock product={product} />
      <p className="text-sm leading-7 text-[#3a3733] sm:text-base">
        {product?.description ?? "No description available for this product."}
      </p>
      <Quantity quantity={quantity} onQuantityChange={onQuantityChange} />
      <Cta onAddToCart={onAddToCart} onBuyNow={onBuyNow} addingLoading={addingLoading} buyingLoading={buyingLoading} />
    </div>
  );
}

function ProductDetails({ product, reviewCount, quantity, onQuantityChange, onAddToCart, onBuyNow, addingLoading, buyingLoading, reviews }: { product: ProductDetailRow | null; reviewCount: number; quantity: number; onQuantityChange: (q: number) => void; onAddToCart: () => void; onBuyNow: () => void; addingLoading: boolean; buyingLoading: boolean; reviews?: ProductReviewRow[] }) {
  return (
    <section className="page-x mx-auto w-full max-w-[1200px] pb-6 pt-5 sm:pb-8 sm:pt-8 lg:pt-16">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
        <Gallery product={product} />
        <Text product={product} reviewCount={reviewCount} quantity={quantity} onQuantityChange={onQuantityChange} onAddToCart={onAddToCart} onBuyNow={onBuyNow} addingLoading={addingLoading} buyingLoading={buyingLoading} reviews={reviews} />
      </div>
    </section>
  );
}

export function ProductDetailLayout({ product, reviews = [] }: { product?: ProductDetailRow | null; reviews?: ProductReviewRow[] }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addingLoading, setAddingLoading] = useState(false);
  const [buyingLoading, setBuyingLoading] = useState(false);

  const handleAddToCart = useCallback(async () => {
    if (!product || !product.vendor_id) {
      alert("Product information is missing.");
      return;
    }

    try {
      setAddingLoading(true);
      const result = await addToCart(product.id, product.vendor_id, product.price, quantity);

      if (!result.success) {
        alert(result.error || "Failed to add to cart.");
        return;
      }

      alert("Added to cart!");
      setQuantity(1);
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingLoading(false);
    }
  }, [product, quantity]);

  const handleBuyNow = useCallback(async () => {
    if (!product || !product.vendor_id) {
      alert("Product information is missing.");
      return;
    }

    try {
      setBuyingLoading(true);
      const result = await addToCart(product.id, product.vendor_id, product.price, quantity);

      if (!result.success) {
        alert(result.error || "Failed to add to cart.");
        return;
      }

      router.push("/cart");
    } catch (err) {
      console.error("Buy now failed:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setBuyingLoading(false);
    }
  }, [product, quantity, router]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-[#fbf7f4] pb-20 sm:pb-10">
      <ProductDetails product={product ?? null} reviewCount={reviews.length} quantity={quantity} onQuantityChange={setQuantity} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} addingLoading={addingLoading} buyingLoading={buyingLoading} reviews={reviews} />
      <ProductDetailReviewsSection reviews={reviews} />
    </main>
  );
}