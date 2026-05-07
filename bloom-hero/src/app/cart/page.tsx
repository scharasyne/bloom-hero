"use client";

import React, { useEffect, useState, useCallback } from "react";
// import NavBar from "@/components/navbar";
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
  const [pendingOrderVendorMap, setPendingOrderVendorMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const isEmpty = cartItems.length === 0;
  const allSelected = !isEmpty && selectedIds.size === cartItems.length;

  const formatSupabaseError = (error: any) => {
    if (!error) return "Unknown database error.";

    const parts = [
      error.message,
      error.details,
      error.hint,
      error.code ? `code: ${error.code}` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" | ") : "Unknown database error.";
  };

  // Group flat cartItems array by vendorName
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
          .select("id, vendor_id, order_date")
          .eq("customer_id", custId)
          .eq("status", "pending")
          .order("order_date", { ascending: false });

        if (ordersError) console.error("Load cart - orders error:", ordersError);

        const orderList = orders ?? [];
        const orderIds = orderList.map((o: any) => o.id);
        const vendorByOrder: Record<string, string> = {};
        for (const order of orderList as Array<{ id: string; vendor_id: string }>) {
          if (order.id && order.vendor_id) {
            vendorByOrder[order.id] = order.vendor_id;
          }
        }

        if (orderIds.length === 0) {
          if (mounted) { setPendingOrderIds([]); setPendingOrderVendorMap({}); setCartItems([]); }
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("order_id, product_id, quantity, subtotal, products(id, product_name, product_image_url, price, stocks)")
          .in("order_id", orderIds);

        if (itemsError) {
          console.error("Load cart - items error:", itemsError);
          if (mounted) { setPendingOrderIds(orderIds); setPendingOrderVendorMap(vendorByOrder); setCartItems([]); }
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

        if (mounted) { setPendingOrderIds(orderIds); setPendingOrderVendorMap(vendorByOrder); setCartItems(mappedItems); }
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
      
      const updatedOrderTotal = cartItems
        .filter((cartItem) => cartItem.orderId === item.orderId)
        .reduce(
          (sum, cartItem) =>
            sum +
            (cartItem.id === productId ? subtotal : cartItem.price * cartItem.qty),
          0
        );

      await supabase
        .from("orders")
        .update({ total_amount: updatedOrderTotal })
        .eq("id", item.orderId);
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

  const handleCheckout = async (selectedPaymentMethod: "online" | "cod") => {
    if (pendingOrderIds.length === 0 || !customerId || selectedIds.size === 0) return;
    try {
      setCheckoutLoading(true);
      const selectedItems = cartItems.filter(item => selectedIds.has(item.id));
      
      // Check stock for all selected items in a single query
      const selectedItemIds = selectedItems.map(item => item.id);
      const { data: stockData } = await supabase
        .from("products")
        .select("id, stocks, product_name")
        .in("id", selectedItemIds);
      const stockMap = new Map((stockData ?? []).map((p: any) => [p.id, p]));
      for (const item of selectedItems) {
        const product = stockMap.get(item.id);
        if (product && product.stocks < item.qty) {
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
      
      // Move each vendor order into the correct next status after checkout.
      const orderIdToNewPendingId = new Map<string, string>();
      for (const [orderId, items] of itemsByOrderId) {
        const vendorTotal = items.reduce((sum, item) => sum + (item.price * item.qty || 0), 0) + 40;
        const nextStatus = selectedPaymentMethod === "online" ? "to_pay" : "to_ship";
        const updatePayload: Record<string, unknown> = {
          status: nextStatus,
          payment_method: selectedPaymentMethod,
          total_amount: vendorTotal,
        };

        // If there are unselected items in this vendor's order, move them to a new
        // pending order before checking out so they remain in the cart.
        const unselectedItemsForVendor = cartItems.filter(
          i => i.orderId === orderId && !selectedIds.has(i.id)
        );

        if (unselectedItemsForVendor.length > 0) {
          const vendorId = pendingOrderVendorMap[orderId];
          if (vendorId) {
            const unselectedTotal = unselectedItemsForVendor.reduce(
              (sum, i) => sum + i.price * i.qty, 0
            );
            const { data: newOrder } = await supabase
              .from("orders")
              .insert({
                customer_id: customerId,
                vendor_id: vendorId,
                status: "pending",
                total_amount: unselectedTotal,
              })
              .select("id")
              .single();

            if (newOrder) {
              const unselectedProductIds = unselectedItemsForVendor.map(i => i.id);
              await supabase
                .from("order_items")
                .update({ order_id: newOrder.id })
                .eq("order_id", orderId)
                .in("product_id", unselectedProductIds);
              orderIdToNewPendingId.set(orderId, newOrder.id);
            }
          }
        }
        
        const { error: updateError } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", orderId);
        
        if (updateError) {
          const formatted = formatSupabaseError(updateError);
          const migrationHint =
            formatted.includes("receipt_proof_url") ||
            formatted.includes("payment_method") ||
            formatted.includes("to_pay") ||
            formatted.includes("to_ship") ||
            formatted.includes("42703") ||
            formatted.includes("22P02")
              ? " Run sql-changes/add_order_payment_flow.sql in Supabase first."
              : "";

          console.error("Failed to update checkout status:", formatted);
          alert(`Failed to process checkout: ${formatted}.${migrationHint}`);
          return;
        }
      }
      
      // Update cart UI: remove checked-out items; update orderId for items moved to a new pending order.
      const newPendingIds = Array.from(orderIdToNewPendingId.values());
      setCartItems(prev =>
        prev
          .filter(item => !selectedIds.has(item.id))
          .map(item => {
            const newId = orderIdToNewPendingId.get(item.orderId);
            return newId ? { ...item, orderId: newId } : item;
          })
      );
      setPendingOrderIds(prev => [
        ...prev.filter(id => !itemsByOrderId.has(id)),
        ...newPendingIds,
      ]);
      setPendingOrderVendorMap(prev => {
        const next: Record<string, string> = {};
        for (const [orderId, vendorId] of Object.entries(prev)) {
          if (!itemsByOrderId.has(orderId)) {
            next[orderId] = vendorId;
          }
        }
        for (const [oldOrderId, newOrderId] of orderIdToNewPendingId.entries()) {
          const vendorId = prev[oldOrderId];
          if (vendorId) {
            next[newOrderId] = vendorId;
          }
        }
        return next;
      });
      setSelectedIds(new Set());
      
      console.log("Checkout complete, redirecting to orders page");
      
      // Add a small delay to ensure database updates propagate
      setTimeout(() => {
        const nextTab = selectedPaymentMethod === "online" ? "to-pay" : "to-ship";
        window.location.href = `/orders?tab=${nextTab}`;
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
        <div className="max-w-275 mx-auto flex gap-6 items-start">

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
          <div className="w-70 shrink-0 sticky top-6">
            <CartSummary 
              cartItems={cartItems} 
              selectedIds={selectedIds}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
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
