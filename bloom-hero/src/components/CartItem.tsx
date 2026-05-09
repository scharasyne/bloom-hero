"use client";

import { Icon } from "@iconify/react";
import { CartItem as CartItemType } from "@/types";

const placeholderImages = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
];

type CartItemProps = {
  item: CartItemType;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
};

const GRID = "grid grid-cols-[minmax(0,1fr)_160px_120px_140px] items-center gap-[12px]";

export default function CartItem({
  item,
  index,
  isSelected,
  onSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const lineTotal = item.price * item.qty;
  const imgSrc = item.imageUrl || placeholderImages[index % placeholderImages.length];

  // ── OUT OF STOCK ─────────────────────────────────────────
  if (item.status === "out-of-stock") {
    return (
      <div className={`${GRID} opacity-50`}>
        <div className="flex items-center gap-[12px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.id)}
            className="w-[18px] h-[18px] accent-[#D96A63] shrink-0 cursor-pointer"
          />
          <div className="w-[80px] h-[80px] rounded-[4px] overflow-hidden shrink-0 grayscale bg-[#f5f5f5]">
            <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-[4px] min-w-0">
            <p className="text-[14px] text-[#333] line-clamp-2 line-through">{item.productName}</p>
            <p className="text-[12px] text-[#D96A63]">Item no longer available</p>
          </div>
        </div>
        <div />
        <div />
        <div className="flex justify-center items-center">
          <button
            onClick={() => onRemove(item.id)}
            className="text-[#888] hover:text-[#D96A63] transition-colors cursor-pointer"
          >
            <Icon icon="mdi:delete-outline" width={20} height={20} />
          </button>
        </div>
      </div>
    );
  }

  // ── PRICE CHANGED ────────────────────────────────────────
  if (item.status === "price-changed") {
    return (
      <div className={GRID}>
        <div className="flex items-center gap-[12px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.id)}
            className="w-[18px] h-[18px] accent-[#D96A63] shrink-0 cursor-pointer"
          />
          <div className="w-[80px] h-[80px] rounded-[4px] overflow-hidden shrink-0 bg-[#f5f5f5]">
            <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-[4px] min-w-0">
            <p className="text-[14px] text-[#333] line-clamp-2">{item.productName}</p>
            <p className="text-[11px] text-[#e08a00]">⚠ Price updated since you added this</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center border border-[#e0e0e0] rounded-[4px] overflow-hidden">
            <button onClick={() => onDecrease(item.id)} className="w-[32px] h-[32px] flex items-center justify-center text-[#555] hover:bg-[#f5f5f5] transition-colors cursor-pointer">
              <Icon icon="mdi:minus" width={14} height={14} />
            </button>
            <span className="w-[40px] h-[32px] flex items-center justify-center text-[13px] font-medium text-[#333] border-x border-[#e0e0e0]">
              {item.qty}
            </span>
            <button onClick={() => onIncrease(item.id)} disabled={item.qty >= item.maxQty} className="w-[32px] h-[32px] flex items-center justify-center text-[#555] hover:bg-[#f5f5f5] transition-colors cursor-pointer disabled:opacity-40">
              <Icon icon="mdi:plus" width={14} height={14} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[2px]">
          <p className="text-[14px] font-semibold text-[#D96A63]">₱{item.price.toFixed(2)}</p>
          <p className="text-[12px] text-[#aaa] line-through">₱{item.oldPrice?.toFixed(2)}</p>
        </div>
        <div className="flex justify-center items-center gap-[12px]">
          <p className="text-[14px] font-bold text-[#333]">₱{lineTotal.toFixed(2)}</p>
          <button onClick={() => onRemove(item.id)} className="text-[#888] hover:text-[#D96A63] transition-colors cursor-pointer">
            <Icon icon="mdi:delete-outline" width={20} height={20} />
          </button>
        </div>
      </div>
    );
  }

  // ── AVAILABLE (DEFAULT) ──────────────────────────────────
  return (
    <div className={GRID}>
      <div className="flex items-center gap-[12px]">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(item.id)}
          className="w-[18px] h-[18px] accent-[#D96A63] shrink-0 cursor-pointer"
        />
        <div className="w-[80px] h-[80px] rounded-[4px] overflow-hidden shrink-0 bg-[#f5f5f5]">
          <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
        </div>
        <p className="text-[14px] text-[#333] line-clamp-2">{item.productName}</p>
      </div>
      <div className="flex justify-center">
        <div className="flex items-center border border-[#e0e0e0] rounded-[4px] overflow-hidden">
          <button onClick={() => onDecrease(item.id)} disabled={item.qty <= 1} className="w-[32px] h-[32px] flex items-center justify-center text-[#555] hover:bg-[#f5f5f5] transition-colors cursor-pointer disabled:opacity-40">
            <Icon icon="mdi:minus" width={14} height={14} />
          </button>
          <span className="w-[40px] h-[32px] flex items-center justify-center text-[13px] font-medium text-[#333] border-x border-[#e0e0e0]">
            {item.qty}
          </span>
          <button onClick={() => onIncrease(item.id)} disabled={item.qty >= item.maxQty} className="w-[32px] h-[32px] flex items-center justify-center text-[#555] hover:bg-[#f5f5f5] transition-colors cursor-pointer disabled:opacity-40">
            <Icon icon="mdi:plus" width={14} height={14} />
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <p className="text-[14px] font-semibold text-[#D96A63]">₱{item.price.toFixed(2)}</p>
      </div>
      <div className="flex justify-center items-center gap-[12px]">
        <p className="text-[14px] font-semibold text-[#333]">₱{lineTotal.toFixed(2)}</p>
        <button onClick={() => onRemove(item.id)} className="text-[#888] hover:text-[#D96A63] transition-colors cursor-pointer">
          <Icon icon="mdi:delete-outline" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}
