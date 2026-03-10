"use client";

import React from "react";
import { useCart } from "@/hooks/useCart";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import CartItem from "@/components/CartItem";
import CartSummary from "@/components/CartSummary";

function DashedDivider() {
  return <div className="border-t border-dashed border-[#d4cfc9] w-full my-[4px]" />;
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-[48px] gap-[12px]">
      <p className="text-[#aaa] text-[14px]">Your cart is empty.</p>
      <a href="/" className="text-[#3f6f52] font-semibold text-[13px] underline">
        Browse Products
      </a>
    </div>
  );
}

export default function CartPage() {
  const { data: cartItems, updateQty, removeItem } = useCart();

  const handleIncrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && item.qty < item.maxQty) updateQty(id, item.qty + 1);
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && item.qty > 1) updateQty(id, item.qty - 1);
  };

  const handleCheckout = () => {
    // TODO: open checkout modal or navigate to /checkout
    console.log("Proceeding to checkout...");
  };

  return (
    <>
      <NavBar />

      <main className="w-full bg-[#ede8e2] min-h-screen px-[24px] py-[64px] flex justify-center">
        <div
          className="bg-white w-full max-w-[480px] rounded-[12px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.14),0px_4px_16px_0px_rgba(0,0,0,0.06)] border border-[#c2d9cb] flex flex-col"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          {/* Receipt header */}
          <div className="flex flex-col items-center py-[28px] px-[28px] border-b border-dashed border-[#d4cfc9]">
            <p className="text-[11px] tracking-[2px] uppercase text-[#aaa] mb-[4px]">BloomHero</p>
            <h1 className="font-bold text-[26px] text-[#3f6f52] tracking-[-0.5px]">Bloom Cart</h1>
            <p className="text-[12px] text-[#bbb] mt-[4px]">Your order summary</p>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-[12px] px-[28px] pt-[16px] pb-[4px]">
            <div className="w-[48px] shrink-0" />
            <p className="flex-1 text-[11px] tracking-[1.5px] uppercase text-[#aaa]">Item</p>
            <p className="text-[11px] tracking-[1.5px] uppercase text-[#aaa] w-[80px] text-center">Qty</p>
            <p className="text-[11px] tracking-[1.5px] uppercase text-[#aaa] w-[60px] text-right">Total</p>
          </div>

          <DashedDivider />

          {/* Cart items */}
          <div className="px-[28px] flex flex-col">
            {cartItems.length === 0 ? (
              <EmptyCart />
            ) : (
              cartItems.map((item, index) => (
                <div key={item.id}>
                  <CartItem
                    item={item}
                    index={index}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={removeItem}
                  />
                  {index < cartItems.length - 1 && (
                    <div className="border-t border-dotted border-[#ebe7e2] w-full" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Summary + Checkout */}
          {cartItems.length > 0 && (
            <>
              <DashedDivider />
              <CartSummary cartItems={cartItems} onCheckout={handleCheckout} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
