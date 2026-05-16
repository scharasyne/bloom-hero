"use client";

import { Icon } from "@iconify/react";
import { CartItem as CartItemType } from "@/types";

const placeholderImages = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200&h=200&fit=crop",
];

const DESKTOP_GRID =
  "hidden md:grid md:grid-cols-[minmax(0,1fr)_140px_100px_120px] md:items-center md:gap-3";

type CartItemProps = {
  item: CartItemType;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
};

function QtyControl({
  itemId,
  qty,
  maxQty,
  onDecrease,
  onIncrease,
}: {
  itemId: string;
  qty: number;
  maxQty: number;
  onDecrease: (id: string) => void;
  onIncrease: (id: string) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-[#e8e4df] bg-white">
      <button
        type="button"
        onClick={() => onDecrease(itemId)}
        disabled={qty <= 1}
        className="flex h-10 w-10 items-center justify-center text-[#555] transition-colors hover:bg-[#f5f3f0] disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Icon icon="mdi:minus" width={16} height={16} />
      </button>
      <span className="flex h-10 min-w-10 items-center justify-center border-x border-[#e8e4df] px-2 text-sm font-semibold text-[#2D2926]">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onIncrease(itemId)}
        disabled={qty >= maxQty}
        className="flex h-10 w-10 items-center justify-center text-[#555] transition-colors hover:bg-[#f5f3f0] disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Icon icon="mdi:plus" width={16} height={16} />
      </button>
    </div>
  );
}

function ProductRow({
  item,
  index,
  isSelected,
  onSelect,
  note,
  nameClassName = "text-sm font-medium text-[#2D2926] line-clamp-2 sm:text-base",
  imageClassName = "",
}: {
  item: CartItemType;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  note?: React.ReactNode;
  nameClassName?: string;
  imageClassName?: string;
}) {
  const imgSrc = item.imageUrl || placeholderImages[index % placeholderImages.length];

  return (
    <div className="flex gap-3 sm:gap-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(item.id)}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#D24B46]"
      />
      <div
        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f5f3f0] sm:h-24 sm:w-24 ${imageClassName}`}
      >
        <img src={imgSrc} alt={item.productName} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className={nameClassName}>{item.productName}</p>
        {note}
      </div>
    </div>
  );
}

function RemoveButton({ onRemove, itemId }: { onRemove: (id: string) => void; itemId: string }) {
  return (
    <button
      type="button"
      onClick={() => onRemove(itemId)}
      className="flex h-10 w-10 items-center justify-center rounded-full text-[#8a847d] transition-colors hover:bg-[#fff3f2] hover:text-[#D24B46]"
      aria-label="Remove item"
    >
      <Icon icon="mdi:delete-outline" width={22} height={22} />
    </button>
  );
}

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

  if (item.status === "out-of-stock") {
    return (
      <>
        <div className="space-y-4 opacity-60 md:hidden">
          <ProductRow
            item={item}
            index={index}
            isSelected={isSelected}
            onSelect={onSelect}
            nameClassName="text-sm font-medium text-[#2D2926] line-clamp-2 line-through"
            imageClassName="grayscale"
            note={<p className="text-xs font-semibold text-[#D24B46]">Item no longer available</p>}
          />
          <div className="flex justify-end pl-8">
            <RemoveButton onRemove={onRemove} itemId={item.id} />
          </div>
        </div>
        <div className={`${DESKTOP_GRID} opacity-50`}>
          <ProductRow
            item={item}
            index={index}
            isSelected={isSelected}
            onSelect={onSelect}
            nameClassName="text-sm text-[#333] line-clamp-2 line-through"
            imageClassName="grayscale"
            note={<p className="text-xs text-[#D24B46]">Item no longer available</p>}
          />
          <div />
          <div />
          <div className="flex items-center justify-center">
            <RemoveButton onRemove={onRemove} itemId={item.id} />
          </div>
        </div>
      </>
    );
  }

  if (item.status === "price-changed") {
    return (
      <>
        <div className="space-y-4 md:hidden">
          <ProductRow
            item={item}
            index={index}
            isSelected={isSelected}
            onSelect={onSelect}
            note={
              <p className="text-xs font-medium text-[#c47f00]">Price updated since you added this</p>
            }
          />
          <div className="flex items-center justify-between gap-3 pl-8 sm:pl-9">
            <QtyControl
              itemId={item.id}
              qty={item.qty}
              maxQty={item.maxQty}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
            />
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-[#D24B46]">₱{item.price.toFixed(2)}</p>
                <p className="text-xs text-[#aaa] line-through">₱{item.oldPrice?.toFixed(2)}</p>
                <p className="text-base font-bold text-[#2D2926]">₱{lineTotal.toFixed(2)}</p>
              </div>
              <RemoveButton onRemove={onRemove} itemId={item.id} />
            </div>
          </div>
        </div>
        <div className={DESKTOP_GRID}>
          <ProductRow
            item={item}
            index={index}
            isSelected={isSelected}
            onSelect={onSelect}
            note={<p className="text-[11px] text-[#e08a00]">Price updated since you added this</p>}
          />
          <div className="flex justify-center">
            <QtyControl
              itemId={item.id}
              qty={item.qty}
              maxQty={item.maxQty}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-semibold text-[#D24B46]">₱{item.price.toFixed(2)}</p>
            <p className="text-xs text-[#aaa] line-through">₱{item.oldPrice?.toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <p className="text-sm font-bold text-[#333]">₱{lineTotal.toFixed(2)}</p>
            <RemoveButton onRemove={onRemove} itemId={item.id} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        <ProductRow item={item} index={index} isSelected={isSelected} onSelect={onSelect} />
        <div className="flex items-center justify-between gap-3 pl-8 sm:pl-9">
          <QtyControl
            itemId={item.id}
            qty={item.qty}
            maxQty={item.maxQty}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
          />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-[#A39E96]">Unit</p>
              <p className="text-sm font-semibold text-[#D24B46]">₱{item.price.toFixed(2)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-[#A39E96]">Total</p>
              <p className="text-base font-bold text-[#2D2926]">₱{lineTotal.toFixed(2)}</p>
            </div>
            <RemoveButton onRemove={onRemove} itemId={item.id} />
          </div>
        </div>
      </div>

      <div className={DESKTOP_GRID}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(item.id)}
            className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#D96A63]"
          />
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#f5f5f5]">
            <img src={imgSrc} alt={item.productName} className="h-full w-full object-cover" />
          </div>
          <p className="line-clamp-2 text-sm text-[#333]">{item.productName}</p>
        </div>
        <div className="flex justify-center">
          <QtyControl
            itemId={item.id}
            qty={item.qty}
            maxQty={item.maxQty}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
          />
        </div>
        <div className="flex justify-center">
          <p className="text-sm font-semibold text-[#D96A63]">₱{item.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <p className="text-sm font-semibold text-[#333]">₱{lineTotal.toFixed(2)}</p>
          <RemoveButton onRemove={onRemove} itemId={item.id} />
        </div>
      </div>
    </>
  );
}
