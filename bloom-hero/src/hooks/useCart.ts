"use client"; // MUST be the very first line

import { useState } from "react";
import { mockCartItems } from "@/lib/mockData";
import type { CartItem } from "@/typess";

export function useCart() {
  const [data, setData] = useState<CartItem[]>(mockCartItems);
  const isLoading = false;
  const error = null;

  const updateQty = (id: string, newQty: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: newQty } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return { data, isLoading, error, updateQty, removeItem };
}
