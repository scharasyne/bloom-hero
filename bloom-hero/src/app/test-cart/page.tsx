"use client";

import React from "react";
import { useCart } from "@/hooks/useCart";

export default function TestCartPage() {
  const { data, isLoading, error } = useCart();
  console.log("TC-SP2-001 | data:", data);
  console.log("TC-SP2-001 | isLoading:", isLoading);
  console.log("TC-SP2-001 | error:", error);

  if (isLoading) return <div>Loading cart...</div>;
  if (error) return <div>Something went wrong.</div>;

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Test Cart</h1>

      {data.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id} className="border rounded p-4">
              <div className="font-medium">{item.productName}</div>
              <div className="text-sm text-gray-600">
                Vendor: {item.vendorName}
              </div>
              <div className="text-sm">
                Qty: {item.qty} • Status: {item.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
