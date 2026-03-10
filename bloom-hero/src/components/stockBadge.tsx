import React from "react";
import { Icon } from "@iconify/react";

interface StockBadgeProps {
  stock: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock }) => {
  if (stock > 5) {
    return (
      <span className="inline-flex items-center gap-2 bg-[#2f6b4f] text-white px-3 py-1 rounded-full text-sm font-medium">
        <Icon icon="mdi:check-circle" width={16} height={16} />
        In Stock ({stock} available)
      </span>
    );
  }

  if (stock > 0) {
    return (
      <span className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
        <Icon icon="mdi:alert-circle" width={16} height={16} />
        Only {stock} left!
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
      <Icon icon="mdi:close-circle" width={16} height={16} />
      Out of Stock
    </span>
  );
};
