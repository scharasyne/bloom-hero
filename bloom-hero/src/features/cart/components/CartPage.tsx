"use client";

import React, { useEffect, useState, useCallback } from "react";
// import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import CartSummary from "@/components/CartSummary";
import VendorCard from "@/components/VendorCard";
import { CART_ORDER_STATUS } from "@/features/orders/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Icon } from "@iconify/react";
import { ShoppingCart } from "lucide-react";

// ── Empty Cart State ──────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 sm:gap-8 sm:py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0ece8] text-[#c0b8b0] sm:h-24 sm:w-24">
        <ShoppingCart className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.5} />
      </div>
      <div className="max-w-xs space-y-2 text-center sm:max-w-sm">
        <p className="text-lg font-bold text-[#2D2926] sm:text-xl">Your cart is empty</p>
        <p className="text-sm leading-relaxed text-[#A39E96] sm:text-base">
          Looks like you haven&apos;t added anything yet.
        </p>
      </div>
      <a
        href="/"
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D24B46] px-8 py-3 text-sm font-semibold text-white shadow-sm shadow-[#D24B46]/20 transition-all hover:bg-[#A53A35] active:scale-[0.98] sm:px-10 sm:text-base"
      >
        Browse Products
      </a>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CartPageView() {
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
        const updatePayload: Record<string, unknown> = {
          status: "to_pay",
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
                status: CART_ORDER_STATUS,
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
        window.location.href = "/orders?tab=to-pay";
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
        className="min-h-screen w-full bg-[#FBF7F4] page-x pb-24 pt-5 sm:pb-16 sm:pt-6 lg:pt-8"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
            <div className="px-0.5">
              <h1 className="text-xl font-bold text-[#2D2926] sm:text-2xl">Your Cart</h1>
              {!isEmpty && (
                <p className="mt-1 text-sm text-[#A39E96]">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
                </p>
              )}
            </div>

            {!isEmpty && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e4df] bg-white px-4 py-4 shadow-sm sm:px-5">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-5 w-5 cursor-pointer accent-[#D24B46]"
                  />
                  <span className="text-sm font-semibold text-[#2D2926]">
                    Select all ({cartItems.length})
                  </span>
                  {selectedIds.size > 0 && (
                    <span className="text-sm font-semibold text-[#D24B46]">
                      {selectedIds.size} selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#8a847d] transition-colors hover:text-[#D24B46] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon icon="mdi:delete-outline" width={18} height={18} />
                  Delete
                </button>
              </div>
            )}

            {isEmpty ? (
              <div className="overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-sm">
                <EmptyCart />
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {Object.entries(groupedItems).map(([vendorName, items]) => (
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
                ))}
              </div>
            )}
          </div>

          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:max-w-sm lg:w-80">
            <CartSummary
              cartItems={cartItems}
              selectedIds={selectedIds}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onCheckout={handleCheckout}
              checkoutLoading={checkoutLoading}
              isCartEmpty={isEmpty}
            />
          </aside>

        </div>
      </main>
      <Footer />
    </>
  );
}
