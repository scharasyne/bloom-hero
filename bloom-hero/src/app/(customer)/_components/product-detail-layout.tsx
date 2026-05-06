"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { ProductDetailRow, ProductReviewRow } from "@/lib/products";
import { addToCart } from "@/app/(customer)/_actions/product-actions";

function MainPicture({ src }: { src: string }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-[24px] size-[420px] bg-[#f4f0eb]">
      <img
        alt="Product"
        className="size-full object-cover pointer-events-none"
        src={src}
      />
    </div>
  );
}

function ChevronButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      className="flex items-center justify-center text-[#5f5f5f] transition hover:text-[#D24B46] shrink-0"
    >
      <span className="text-[40px] leading-none">{direction === "left" ? "‹" : "›"}</span>
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
      className={`shrink-0 overflow-hidden rounded-[16px] size-[116px] border transition cursor-pointer ${
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

  return (
    <div className="flex flex-col items-center w-[560px]">
      <MainPicture src={imageUrls[currentIndex] ?? null} />

      <div className="mt-4 flex items-center gap-3">
        <ChevronButton direction="left" onClick={handlePrevious} />

        <div className="flex gap-3 overflow-hidden">
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
    : (product?.average_rating ?? 0);
  const safeRating = Math.max(0, Math.min(5, Math.round(averageRating)));

  return (
    <div className="flex flex-col gap-[12px]">
      <h1 className="text-[36px] font-semibold leading-tight text-[#1f1f1f]">
        {product?.product_name ?? "Product"}
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className={index < safeRating ? "text-[#f4b740]" : "text-[#d9d4cd]"}>
                ★
              </span>
            ))}
          </div>
          <span className="text-[16px] font-semibold text-[#1f1f1f]">
            {averageRating ? Number(averageRating).toFixed(1) : "—"}
          </span>
        </div>
        <span className="text-[16px] text-[#6b6b6b]">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
      </div>
      <div className="flex items-center gap-1 text-[16px] text-[#6b6b6b]">
        <Icon icon="mdi:map-marker-outline" className="size-[20px] shrink-0" />
        <span>{product?.shop_name ?? "Unknown vendor"}</span>
      </div>
    </div>
  );
}

function Tags() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
        Fresh
      </span>
      <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
        Handmade
      </span>
      <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-[14px] text-[#4d4a46]">
        For delivery
      </span>
    </div>
  );
}

function PriceStock({ product }: { product: ProductDetailRow | null }) {
  return (
    <div className="flex items-center gap-4">
      <strong className="text-[24px] font-semibold text-[#2f5d3a]">₱{product?.price ?? "—"}</strong>
      <div className="bg-[#2f5d3a] flex gap-[6px] items-center px-[12px] py-[6px] rounded-[999px]">
        <Icon icon="mdi:check" className="size-[18px] text-white shrink-0" />
        <span className="font-medium text-[14px] text-white whitespace-nowrap">
          In Stock ({product?.sold_count ?? 0} available)
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
    <div className="flex items-center gap-3">
      <span className="text-[16px] font-medium text-[#1f1f1f]">Quantity:</span>
      <div className="flex items-center rounded-full border border-[#edeae6] bg-white">
        <button
          onClick={handleDecrement}
          className="px-4 py-2 text-[18px] text-[#1f1f1f] hover:text-[#D24B46] transition"
        >
          −
        </button>
        <span className="min-w-10 px-3 text-center text-[16px] text-[#1f1f1f]">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="px-4 py-2 text-[18px] text-[#1f1f1f] hover:text-[#D24B46] transition"
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
      className="w-full rounded-full border-2 border-[#e6e1dc] px-5 py-3 text-[16px] font-semibold text-[#D24B46] transition hover:border-[#D24B46] hover:bg-[#fff5f3] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
      className="w-full rounded-full bg-[#D24B46] px-5 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#b03d33] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
  return (
    <div className="flex max-w-[560px] flex-col gap-[32px]">
      <Headline product={product} reviewCount={reviewCount} reviews={reviews} />
      <Tags />
      <PriceStock product={product} />
      <p className="text-[16px] leading-7 text-[#3a3733]">
        {product?.description ?? "No description available for this product."}
      </p>
      <Quantity quantity={quantity} onQuantityChange={onQuantityChange} />
      <Cta onAddToCart={onAddToCart} onBuyNow={onBuyNow} addingLoading={addingLoading} buyingLoading={buyingLoading} />
    </div>
  );
}

function ProductDetails({ product, reviewCount, quantity, onQuantityChange, onAddToCart, onBuyNow, addingLoading, buyingLoading, reviews }: { product: ProductDetailRow | null; reviewCount: number; quantity: number; onQuantityChange: (q: number) => void; onAddToCart: () => void; onBuyNow: () => void; addingLoading: boolean; buyingLoading: boolean; reviews?: ProductReviewRow[] }) {
  return (
    <section className="w-full max-w-[1200px] px-[64px] pt-[64px] pb-[32px]">
      <div className="flex items-start gap-[48px]">
        <Gallery product={product} />
        <Text product={product} reviewCount={reviewCount} quantity={quantity} onQuantityChange={onQuantityChange} onAddToCart={onAddToCart} onBuyNow={onBuyNow} addingLoading={addingLoading} buyingLoading={buyingLoading} reviews={reviews} />
      </div>
    </section>
  );
}

type ReviewCardProps = {
  name: string;
  review: string;
  rating: number;
  date: string;
  approved?: boolean;
};

function Stars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <p className="text-[14px] leading-none">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < safeRating ? "text-[#f4b740]" : "text-[#d9d4cd]"}>
          ★
        </span>
      ))}
    </p>
  );
}

function ReviewCard({ name, review, rating, date, approved = false }: ReviewCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-[24px] border border-[#edeae6] bg-[#f6f1ee] p-[24px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex size-[56px] items-center justify-center rounded-full bg-[#edeae6] text-[16px] font-semibold text-[#5f5f5f]">
          {initials || "C"}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-bold text-[#1f1f1f]">{name}</p>
            {approved ? (
              <Icon
                icon="mdi:check-decagram"
                className="size-[16px] text-[#2e7d5b]"
                aria-label="Approved review"
              />
            ) : null}
          </div>
          <Stars rating={rating} />
        </div>
      </div>
      <p className="mt-4 text-[16px] leading-7 text-[#4f4b47]">
        {review || "No comment provided."}
      </p>
      <p className="mt-3 text-[14px] text-[#6b6b6b]">{date}</p>
    </div>
  );
}

function formatReviewDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ReviewsSection({ reviews }: { reviews: ProductReviewRow[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedReviews = isExpanded ? reviews : reviews.slice(0, 3);
  const totalReviews = reviews.length;

  return (
    <section className="w-full max-w-[1200px] px-[64px] pb-[64px]">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[32px] font-bold text-[#1f1f1f]">Customer Reviews</h2>
        {totalReviews > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[16px] font-medium text-[#1f1f1f] hover:text-[#D24B46] underline cursor-pointer transition"
          >
            {isExpanded ? "Show less" : `View all ${totalReviews} reviews`}
          </button>
        )}
      </div>
      {totalReviews === 0 ? (
        <p className="mt-[24px] rounded-[24px] border border-[#edeae6] bg-[#f6f1ee] px-[24px] py-[28px] text-[16px] text-[#4f4b47]">
          No reviews yet for this product.
        </p>
      ) : (
        <div className="mt-[24px] grid gap-[20px] lg:grid-cols-3">
          {displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.customerName}
              review={review.comment ?? ""}
              rating={review.rating}
              date={formatReviewDate(review.reviewDate)}
              approved={review.status === "approved"}
            />
          ))}
        </div>
      )}
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
    <div className="flex w-full flex-col items-center bg-[#fbf7f4]">
      <ProductDetails product={product ?? null} reviewCount={reviews.length} quantity={quantity} onQuantityChange={setQuantity} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} addingLoading={addingLoading} buyingLoading={buyingLoading} reviews={reviews} />
      <ReviewsSection reviews={reviews} />
    </div>
  );
}