"use client";

import React, { useEffect, useState, useCallback } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import CartItem from "@/components/CartItem";
import CartSummary from "@/components/CartSummary";
import VendorCard from "@/components/VendorCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Icon } from "@iconify/react";

// const GRID = "grid grid-cols-[minmax(0,1fr)_160px_120px_140px] items-center gap-[12px]";

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
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  // Group flat cartItems array by vendorName
  const groupedItems = cartItems.reduce<Record<string, typeof cartItems>>((acc, item) => {
    const vendor = item.vendorName || "BloomHero Vendor";
    if (!acc[vendor]) acc[vendor] = [];
    acc[vendor].push(item);
    return acc;
  }, {});

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((i) => i.id)));
    }
  };

  const getVendorItemIds = (vendorName: string) =>
  groupedItems[vendorName]?.map((i) => i.id) ?? [];

  const isVendorSelected = (vendorName: string) => {
    const ids = getVendorItemIds(vendorName);
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  };

  const toggleVendorSelect = (vendorName: string) => {
    const ids = getVendorItemIds(vendorName);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isVendorSelected(vendorName)) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await handleRemove(id);
    }
    setSelectedIds(new Set());
  };

  useEffect(() => {
    let mounted = true;

    const loadCartForCustomer = async (custId: string) => {
      try {
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, order_date")
          .eq("customer_id", custId)
          .eq("status", "pending")
          .order("order_date", { ascending: false });

        if (ordersError) console.error("Load cart - orders error:", ordersError);

        const orderList = orders ?? [];
        const orderIds = orderList.map((o: any) => o.id);

        if (orderIds.length === 0) {
          if (mounted) { setPendingOrderId(null); setCartItems([]); }
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("order_id, product_id, quantity, subtotal, products(id, product_name, product_image_url, price, stocks)")
          .in("order_id", orderIds);

        if (itemsError) {
          console.error("Load cart - items error:", itemsError);
          if (mounted) { setPendingOrderId(orderIds[0]); setCartItems([]); }
          return;
        }

        const mappedItems = items?.map((row: any) => {
          const product = row.products || {};
          const stocks = product.stocks ?? 0;
          return {
            id: row.product_id,
            productName: product.product_name ?? "",
            vendorName: product.vendor_name ?? "BloomHero Vendor",
            price: product.price ?? 0,
            qty: row.quantity ?? 0,
            maxQty: stocks || row.quantity || 0,
            status: stocks <= 0 ? "out-of-stock" : "available",
            imageUrl: product.product_image_url ?? "",
          };
        }) ?? [];

        if (mounted) { setPendingOrderId(orderIds[0]); setCartItems(mappedItems); }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    const initializeCustomerAndCart = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        if (error) { console.error("Auth error:", error); return; }
        const { user } = data;
        if (!user) { console.log("No user found"); return; }
        if (mounted) setCustomerId(user.id);
        await loadCartForCustomer(user.id);
      } catch (err) {
        console.error("Customer/cart init failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeCustomerAndCart();
    return () => { mounted = false; };
  }, [supabase]);

  const getTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.qty || 0), 0);
  }, [cartItems]);

  const updateCartItem = async (productId: string, newQty: number) => {
    if (!pendingOrderId || !customerId) return;
    if (newQty === 0) { handleRemove(productId); return; }
    try {
      const item = cartItems.find(i => i.id === productId);
      if (!item) return;
      const subtotal = item.price * newQty;
      await supabase.from("order_items").upsert(
        { order_id: pendingOrderId, product_id: productId, quantity: newQty, subtotal },
        { onConflict: "order_id,product_id" }
      );
      setCartItems(prev => prev.map(i => i.id === productId ? { ...i, qty: newQty, subtotal } : i));
      await supabase.from("orders").update({ total_amount: getTotal() }).eq("id", pendingOrderId);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleIncrease = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item && item.qty < item.maxQty) updateCartItem(id, item.qty + 1);
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item && item.qty > 1) updateCartItem(id, item.qty - 1);
  };

  const handleRemove = async (id: string) => {
    if (!pendingOrderId) return;
    try {
      await supabase.from("order_items").delete().eq("order_id", pendingOrderId).eq("product_id", id);
      setCartItems(prev => prev.filter(i => i.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      await supabase.from("orders").update({ total_amount: getTotal() }).eq("id", pendingOrderId);
    } catch (error) {
      console.error("Remove failed:", error);
    }
  };

  const handleCheckout = async () => {
    if (!pendingOrderId || cartItems.length === 0) return;
    try {
      setCheckoutLoading(true);
      for (const item of cartItems) {
        const { data } = await supabase.from("products").select("stocks, product_name").eq("id", item.id).single();
        if (data?.stocks < item.qty) { alert(`Not enough stock for ${item.productName}`); return; }
      }
      await supabase.from("orders").update({ status: "completed", total_amount: getTotal() }).eq("id", pendingOrderId);
      setCartItems([]);
      window.location.href = "/customer/orders";
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="text-lg text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-lg shadow-xl p-8 text-center border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Please Sign In</h2>
          <p className="text-gray-700 mb-6">You need to be logged in to view your cart.</p>
          <a href="/login" className="bg-[#D96A63] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#c45e58] transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar type = "customer" />
      <main
        className="w-full bg-[#f5f5f5] min-h-screen px-[24px] py-[32px]"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <div className="max-w-[1100px] mx-auto flex gap-[24px] items-start">

          {/* ── Left: Items list ── */}
          <div className="flex-1 flex flex-col gap-[12px]">

            {/* Select All bar */}
            <div className="bg-white rounded-[8px] px-[20px] py-[14px] flex items-center justify-between border border-[#e8e8e8]">
              <div className="flex items-center gap-[12px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-[18px] h-[18px] accent-[#D96A63] cursor-pointer"
                />
                <span className="text-[13px] font-medium text-[#333]">
                  SELECT ALL ({cartItems.length} ITEMS)
                </span>
                {selectedIds.size > 0 && (
                  <span className="text-[13px] text-[#D96A63] font-semibold">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-[6px] text-[13px] text-[#888] hover:text-[#D96A63] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Icon icon="mdi:delete-outline" width={16} height={16} />
                DELETE
              </button>
            </div>

            {/* Cart Items grouped by vendor */}
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-[8px] border border-[#e8e8e8]">
                <EmptyCart />
              </div>
            ) : (
              Object.entries(groupedItems).map(([vendorName, items]) => (
                <VendorCard
                  key={vendorName}
                  vendorName={vendorName}
                  items={items}
                  selectedIds={selectedIds}
                  isVendorSelected={isVendorSelected(vendorName)}
                  onVendorSelect={() => toggleVendorSelect(vendorName)}
                  onItemSelect={toggleSelectItem}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="w-[280px] shrink-0 sticky top-[24px]">
            <CartSummary cartItems={cartItems} onCheckout={handleCheckout} />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}


