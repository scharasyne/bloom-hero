"use client";

import { CartItem as CartItemType } from "@/typess";

const placeholderImages = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
];

type CartItemProps = {
  item: CartItemType;
  index: number;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function CartItem({
  item,
  index,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const lineTotal = item.price * item.qty;
  const imgSrc = item.imageUrl || placeholderImages[index % placeholderImages.length];

  // ── OUT OF STOCK STATE ──────────────────────────────────
  if (item.status === "out-of-stock") {
    return (
      <div className="flex items-center gap-[12px] py-[12px] opacity-50">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0 grayscale">
          <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[13px] text-[#7a7a7a] leading-[20px]">{item.vendorName}</p>
          <p className="font-semibold text-[14px] text-[#1f1f1f] line-through leading-[20px]">
            {item.productName}
          </p>
          <p className="text-[12px] text-[#d24b46] leading-[18px]">Item no longer available</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-[12px] text-[#d24b46] font-semibold underline cursor-pointer"
        >
          Remove
        </button>
      </div>
    );
  }

  // ── PRICE CHANGED STATE ─────────────────────────────────
  if (item.status === "price-changed") {
    return (
      <div className="flex items-center gap-[12px] py-[12px]">
        <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0">
          <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[13px] text-[#7a7a7a] leading-[20px]">{item.vendorName}</p>
          <p className="font-semibold text-[14px] text-[#1f1f1f] leading-[20px]">{item.productName}</p>
          <div className="flex items-center gap-[6px]">
            <p className="text-[12px] text-[#aaa] line-through leading-[18px]">
              ₱ {item.oldPrice} / stem
            </p>
            <p className="text-[12px] text-[#d24b46] leading-[18px]">
              ₱ {item.price} / stem
            </p>
          </div>
          <p className="text-[11px] text-[#e08a00] leading-[16px]">
            ⚠ Price updated since you added this
          </p>
        </div>
        <div className="flex items-center gap-[8px] border border-[#e0dbd5] rounded-[8px] px-[8px] py-[4px] bg-white">
          <button
            onClick={() => onDecrease(item.id)}
            className="text-[14px] text-[#555] w-[16px] text-center cursor-pointer"
          >
            –
          </button>
          <span className="text-[13px] font-medium text-[#1f1f1f] min-w-[16px] text-center">
            {item.qty}
          </span>
          <button
            onClick={() => onIncrease(item.id)}
            className="text-[14px] text-[#555] w-[16px] text-center cursor-pointer"
            disabled={item.qty >= item.maxQty}
          >
            +
          </button>
        </div>
        <p className="text-[14px] font-semibold text-[#1f1f1f] w-[60px] text-right shrink-0">
          ₱ {lineTotal}
        </p>
      </div>
    );
  }

  // ── AVAILABLE (DEFAULT) STATE ───────────────────────────
  return (
    <div className="flex items-center gap-[12px] py-[12px]">
      <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0">
        <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-[13px] text-[#7a7a7a] leading-[20px]">{item.vendorName}</p>
        <p className="font-semibold text-[14px] text-[#1f1f1f] leading-[20px]">{item.productName}</p>
        <p className="text-[12px] text-[#aaa] leading-[18px]">₱ {item.price} / stem</p>
      </div>
      <div className="flex items-center gap-[8px] border border-[#e0dbd5] rounded-[8px] px-[8px] py-[4px] bg-white">
        <button
          onClick={() => onDecrease(item.id)}
          className="text-[14px] text-[#555] w-[16px] text-center cursor-pointer"
          disabled={item.qty <= 1}
        >
          –
        </button>
        <span className="text-[13px] font-medium text-[#1f1f1f] min-w-[16px] text-center">
          {item.qty}
        </span>
        <button
          onClick={() => onIncrease(item.id)}
          className="text-[14px] text-[#555] w-[16px] text-center cursor-pointer"
          disabled={item.qty >= item.maxQty}
        >
          +
        </button>
      </div>
      <p className="text-[14px] font-semibold text-[#1f1f1f] w-[60px] text-right shrink-0">
        ₱ {lineTotal}
      </p>
    </div>
  );
}
