"use client";

import React, { useEffect, useState, useCallback } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import CartSummary from "@/components/CartSummary";
import VendorCard from "@/components/VendorCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Icon } from "@iconify/react";
import { ShoppingCart } from "lucide-react";

// ── Empty Cart State ──────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ece8] text-[#c0b8b0]">
        <ShoppingCart size={28} strokeWidth={1.5} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-[#2D2926]">Your cart is empty</p>
        <p className="text-xs text-[#A39E96]">Looks like you haven't added anything yet.</p>
      </div>
      <a
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#D24B46] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#D24B46]/20 transition-all hover:bg-[#A53A35] active:scale-95"
      >
        Browse Products
      </a>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CartPage() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [pendingOrderIds, setPendingOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isEmpty = cartItems.length === 0;
  const allSelected = !isEmpty && selectedIds.size === cartItems.length;

  const groupedItems = cartItems.reduce<Record<string, typeof cartItems>>((acc, item) => {
    const vendor = item.vendorName || "BloomHero Vendor";
    if (!acc[vendor]) acc[vendor] = [];
    acc[vendor].push(item);
    return acc;
  }, {});

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(cartItems.map((i) => i.id)));
  };

  const getVendorItemIds = (vendorName: string) => groupedItems[vendorName]?.map((i) => i.id) ?? [];

  const isVendorSelected = (vendorName: string) => {
    const ids = getVendorItemIds(vendorName);
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  };

  const toggleVendorSelect = (vendorName: string) => {
    const ids = getVendorItemIds(vendorName);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isVendorSelected(vendorName)) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
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
    for (const id of selectedIds) await handleRemove(id);
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
          if (mounted) { setPendingOrderIds([]); setCartItems([]); }
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("order_id, product_id, quantity, subtotal, products(id, product_name, product_image_url, price, stocks)")
          .in("order_id", orderIds);

        if (itemsError) {
          console.error("Load cart - items error:", itemsError);
          if (mounted) { setPendingOrderIds(orderIds); setCartItems([]); }
          return;
        }

        const mappedItems = items?.map((row: any) => {
          const product = row.products || {};
          const stocks = product.stocks ?? 0;
          return {
            id: row.product_id,
            orderId: row.order_id,
            productName: product.product_name ?? "",
            vendorName: product.vendor_name ?? "BloomHero Vendor",
            price: product.price ?? 0,
            qty: row.quantity ?? 0,
            maxQty: stocks || row.quantity || 0,
            status: stocks <= 0 ? "out-of-stock" : "available",
            imageUrl: product.product_image_url ?? "",
          };
        }) ?? [];

        if (mounted) { setPendingOrderIds(orderIds); setCartItems(mappedItems); }
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

  const getTotal = useCallback((filterBySelected: boolean = false) => {
    const itemsToSum = filterBySelected 
      ? cartItems.filter(item => selectedIds.has(item.id))
      : cartItems;
    return itemsToSum.reduce((sum, item) => sum + (item.price * item.qty || 0), 0);
  }, [cartItems, selectedIds]);

  const updateCartItem = async (productId: string, newQty: number) => {
    if (pendingOrderIds.length === 0 || !customerId) return;
    if (newQty === 0) { handleRemove(productId); return; }
    try {
      const item = cartItems.find(i => i.id === productId);
      if (!item) return;
      const subtotal = item.price * newQty;
      await supabase.from("order_items").upsert(
        { order_id: item.orderId, product_id: productId, quantity: newQty, subtotal },
        { onConflict: "order_id,product_id" }
      );
      setCartItems(prev => prev.map(i => i.id === productId ? { ...i, qty: newQty, subtotal } : i));
      
      // Update all affected orders' total amounts
      const orderTotals = new Map<string, number>();
      for (const cartItem of cartItems) {
        const total = orderTotals.get(cartItem.orderId) || 0;
        orderTotals.set(cartItem.orderId, total + (cartItem.id === productId ? subtotal : cartItem.price * cartItem.qty));
      }
      
      for (const [orderId, total] of orderTotals) {
        await supabase.from("orders").update({ total_amount: total }).eq("id", orderId);
      }
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
    if (pendingOrderIds.length === 0) return;
    try {
      const item = cartItems.find(i => i.id === id);
      if (!item) return;
      
      await supabase.from("order_items").delete().eq("order_id", item.orderId).eq("product_id", id);
      setCartItems(prev => prev.filter(i => i.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      
      // Update the affected order's total
      const orderTotal = cartItems
        .filter(i => i.orderId === item.orderId && i.id !== id)
        .reduce((sum, i) => sum + (i.price * i.qty), 0);
      
      if (orderTotal === 0) {
        // Delete the order if no items remain
        await supabase.from("orders").delete().eq("id", item.orderId);
        setPendingOrderIds(prev => prev.filter(id => id !== item.orderId));
      } else {
        await supabase.from("orders").update({ total_amount: orderTotal }).eq("id", item.orderId);
      }
    } catch (error) {
      console.error("Remove failed:", error);
    }
  };

  const handleCheckout = async () => {
    if (pendingOrderIds.length === 0 || !customerId || selectedIds.size === 0) return;
    try {
      setCheckoutLoading(true);
      const selectedItems = cartItems.filter(item => selectedIds.has(item.id));
      
      // Check stock for selected items only
      for (const item of selectedItems) {
        const { data } = await supabase.from("products").select("stocks, product_name").eq("id", item.id).single();
        if (data?.stocks < item.qty) { 
          alert(`Not enough stock for ${item.productName}`); 
          return; 
        }
      }
      
      // Group selected items by their vendor/orderid
      const itemsByOrderId = new Map<string, typeof selectedItems>();
      for (const item of selectedItems) {
        if (!itemsByOrderId.has(item.orderId)) {
          itemsByOrderId.set(item.orderId, []);
        }
        itemsByOrderId.get(item.orderId)!.push(item);
      }
      
      // Mark each vendor's order as completed with their selected items total
      for (const [orderId, items] of itemsByOrderId) {
        const vendorTotal = items.reduce((sum, item) => sum + (item.price * item.qty || 0), 0) + 40;
        
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            status: "completed", 
            total_amount: vendorTotal
          })
          .eq("id", orderId);
        
        if (updateError) {
          console.error("Failed to update order to completed:", updateError);
          alert("Failed to complete order. Please try again.");
          return;
        }
        
        // Delete unselected items from this vendor's order
        const unselectedItemsForVendor = cartItems.filter(
          i => i.orderId === orderId && !selectedIds.has(i.id)
        );
        
        for (const item of unselectedItemsForVendor) {
          await supabase
            .from("order_items")
            .delete()
            .eq("order_id", orderId)
            .eq("product_id", item.id);
        }
      }
      
      // Update cart UI to remove checked items
      setCartItems(cartItems.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      
      console.log("Checkout complete, redirecting to orders page");
      
      // Add a small delay to ensure database updates propagate
      setTimeout(() => {
        window.location.href = "/customer/orders";
      }, 500);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F4] flex items-center justify-center p-4">
        <div className="text-sm font-semibold text-[#6D6863]">Loading cart…</div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center border border-[#e8e8e8]">
          <h2 className="text-lg font-bold text-[#2D2926] mb-2">Sign in to view your cart</h2>
          <p className="text-sm text-[#6D6863] mb-6">You need to be logged in to continue.</p>
          <a
            href="/login"
            className="inline-block rounded-full bg-[#D24B46] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A53A35] active:scale-95"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <NavBar type="customer" /> */}
      <main
        className="w-full bg-[#FBF7F4] min-h-screen px-6 py-8"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <div className="max-w-[1100px] mx-auto flex gap-6 items-start">

          {/* Left: Items list */}
          <div className="flex-1 flex flex-col gap-3">

            {/* Select All bar — only visible when cart has items */}
            {!isEmpty && (
              <div className="bg-white rounded-xl px-5 py-3.5 flex items-center justify-between border border-[#e8e8e8]">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#D24B46] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#2D2926] uppercase tracking-wide">
                    Select All ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                  </span>
                  {selectedIds.size > 0 && (
                    <span className="text-xs text-[#D24B46] font-semibold">
                      {selectedIds.size} selected
                    </span>
                  )}
                </div>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-[#D24B46] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon icon="mdi:delete-outline" width={15} height={15} />
                  Delete
                </button>
              </div>
            )}

            {/* Empty state or vendor-grouped items */}
            {isEmpty ? (
              <div className="bg-white rounded-xl border border-[#e8e8e8]">
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
            <CartSummary 
              cartItems={cartItems} 
              selectedIds={selectedIds}
              onCheckout={handleCheckout} 
              checkoutLoading={checkoutLoading}
            />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
