"use client";

import { StockBadge } from "@/components/stockBadge";
import { Product as product } from "@/typess";

const placeholderImages = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
];

type ProductProps = {
  product: product; // use the interface you defined
  index: number;
  onAddToCart?: (id: string, qty: number) => void;
  onBuyNow?: (id: string, qty: number) => void;
};

export default function ProductCard({ product, index, onAddToCart, onBuyNow }: ProductProps) {
  const imgSrc =
    product.imageUrl?.[0] || placeholderImages[index % placeholderImages.length];

  // ── OUT OF STOCK STATE ──────────────────────────────────
  if (product.status === "out-of-stock" || product.qty === 0) {
    return (
      <div className="flex flex-col gap-[12px] p-[12px] opacity-50">
        <div className="w-[200px] h-[200px] rounded-xl overflow-hidden shrink-0 grayscale">
          <img src={imgSrc} alt={product.productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[13px] text-[#7a7a7a] leading-[20px]">{product.vendorName}</p>
          <p className="font-semibold text-[16px] text-[#1f1f1f] line-through leading-[20px]">
            {product.productName}
          </p>
          <p className="text-[12px] text-[#d24b46] leading-[18px]">Out of Stock</p>
        </div>
      </div>
    );
  }

  // ── PRICE CHANGED STATE ─────────────────────────────────
  if (product.status === "price-changed") {
    return (
      <div className="flex flex-col gap-[12px] p-[12px]">
        <div className="w-[200px] h-[200px] rounded-xl overflow-hidden shrink-0">
          <img src={imgSrc} alt={product.productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[13px] text-[#7a7a7a] leading-[20px]">{product.vendorName}</p>
          <p className="font-semibold text-[16px] text-[#1f1f1f] leading-[20px]">{product.productName}</p>
          <div className="flex items-center gap-[6px]">
            {/* If you want oldPrice, add it to Product interface */}
            <p className="text-[12px] text-[#aaa] line-through leading-[18px]">₱ {/* oldPrice here */}</p>
            <p className="text-[12px] text-[#d24b46] leading-[18px]">₱ {product.price}</p>
          </div>
          <p className="text-[11px] text-[#e08a00] leading-[16px]">
            ⚠ Price updated since you added this
          </p>
        </div>
        <StockBadge stock={product.qty} />
      </div>
    );
  }

  // ── AVAILABLE (DEFAULT) STATE ───────────────────────────
  return (
    <div className="flex flex-col gap-[12px] p-[12px]">
      <div className="w-[200px] h-[200px] rounded-xl overflow-hidden shrink-0">
        <img src={imgSrc} alt={product.productName} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-[13px] text-[#7a7a7a] leading-[20px]">{product.vendorName}</p>
        <p className="font-semibold text-[16px] text-[#1f1f1f] leading-[20px]">{product.productName}</p>
        <p className="text-[12px] text-[#aaa] leading-[18px]">₱ {product.price}</p>
      </div>
      <StockBadge stock={product.qty} />

      {/* Actions */}
      <div className="flex gap-[8px] mt-[8px]">
        <button
          onClick={() => onAddToCart?.(product.id, 1)}
          className="px-[12px] py-[6px] rounded-[8px] bg-green-600 text-white text-[13px]"
        >
          Add to Cart
        </button>
        <button
          onClick={() => onBuyNow?.(product.id, 1)}
          className="px-[12px] py-[6px] rounded-[8px] bg-red-600 text-white text-[13px]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
