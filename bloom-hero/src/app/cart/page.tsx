"use client";

import React, { useEffect, useState, useCallback } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import CartItem from "@/components/CartItem";
import CartSummary from "@/components/CartSummary";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

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
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

        if (ordersError) {
          console.error("Load cart - orders error:", ordersError);
        }

        const orderList = orders ?? [];
        const orderIds = orderList.map((o: any) => o.id);

        if (orderIds.length === 0) {
          if (mounted) {
            setPendingOrderId(null);
            setCartItems([]);
          }
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select(
            "order_id, product_id, quantity, subtotal, products(id, product_name, product_image_url, price, stocks)"
          )
          .in("order_id", orderIds);

        if (itemsError) {
          console.error("Load cart - items error:", itemsError);
          if (mounted) {
            setPendingOrderId(orderIds[0]);
            setCartItems([]);
          }
          return;
        }

        const mappedItems =
          items?.map((row: any) => {
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

        if (mounted) {
          setPendingOrderId(orderIds[0]);
          setCartItems(mappedItems);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    const initializeCustomerAndCart = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.getUser();
        console.log("getUser response:", data, "error:", error);

        if (error) {
          console.error("Auth error:", error);
          return;
        }

        const { user } = data;
        if (!user) {
          console.log("No user found - redirecting to login");
          return;
        }

        console.log("✅ User found:", user.id);
        if (mounted) {
          setCustomerId(user.id);
        }

        await loadCartForCustomer(user.id);
      } catch (err) {
        console.error("Customer/cart init failed:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeCustomerAndCart();

    return () => {
      mounted = false;
    };
  }, [supabase]);


  useEffect(() => {
    let mounted = true;

  const initializeCustomer = async () => {
    try {
      setLoading(true);
      
      // Get user with detailed logging
      const { data, error } = await supabase.auth.getUser();
      console.log("getUser response:", data, "error:", error);
      
      if (error) {
        console.error("Auth error:", error);
        if (mounted) setLoading(false);
        return;
      }

      const { user } = data;
      if (!user) {
        console.log("No user found - redirecting to login");
        if (mounted) setLoading(false);
        return;
      }

      console.log("✅ User found:", user.id);
      if (mounted) {
        setCustomerId(user.id); // customer_id = auth.users.id
        setLoading(false);
      }
    } catch (err) {
      console.error("Customer init failed:", err);
      if (mounted) setLoading(false);
    }
  };

  initializeCustomer();
  return () => { mounted = false; };
}, [supabase]);



  const getTotal = useCallback(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price * item.qty || 0),
      0
    );
  }, [cartItems]);

  const updateCartItem = async (productId: string, newQty: number) => {
    if (!pendingOrderId || !customerId) return;

    if (newQty === 0) {
      handleRemove(productId);
      return;
    }

    try {
      const item = cartItems.find(i => i.id === productId);
      if (!item) return;

      const subtotal = item.price * newQty;

      await supabase
        .from("order_items")
        .upsert(
          {
            order_id: pendingOrderId,
            product_id: productId,
            quantity: newQty,
            subtotal,
          },
          { onConflict: "order_id,product_id" }
        );

      setCartItems(prev => prev.map(i => 
        i.id === productId ? { ...i, qty: newQty, subtotal } : i
      ));

      await supabase
        .from("orders")
        .update({ total_amount: getTotal() })
        .eq("id", pendingOrderId);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleIncrease = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item && item.qty < item.maxQty) {
      updateCartItem(id, item.qty + 1);
    }
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item && item.qty > 1) {
      updateCartItem(id, item.qty - 1);
    }
  };

  const handleRemove = async (id: string) => {
    if (!pendingOrderId) return;
    try {
      await supabase
        .from("order_items")
        .delete()
        .eq("order_id", pendingOrderId)
        .eq("product_id", id);

      setCartItems(prev => prev.filter(i => i.id !== id));
      await supabase
        .from("orders")
        .update({ total_amount: getTotal() })
        .eq("id", pendingOrderId);
    } catch (error) {
      console.error("Remove failed:", error);
    }
  };

  const handleCheckout = async () => {
    if (!pendingOrderId || cartItems.length === 0) return;

    try {
      setCheckoutLoading(true);

      // Stock check
      for (const item of cartItems) {
        const { data } = await supabase
          .from("products")
          .select("stocks, product_name")
          .eq("id", item.id)
          .single();

        if (data?.stocks < item.qty) {
          alert(`Not enough stock for ${item.productName}`);
          return;
        }
      }

      await supabase
        .from("orders")
        .update({ 
          status: "completed", 
          total_amount: getTotal()
        })
        .eq("id", pendingOrderId);

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
    <div className="min-h-screen bg-[#ede8e2] flex items-center justify-center p-4">
      <div className="text-lg text-gray-600">Loading cart...</div>
    </div>
  );
}

if (!customerId) {
  return (
    <div className="min-h-screen bg-[#ede8e2] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-lg shadow-xl p-8 text-center border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">Please Sign In</h2>
        <p className="text-gray-700 mb-6">You need to be logged in to view your cart.</p>
        <a 
          href="/login" 
          className="bg-[#3f6f52] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2f5a42] transition-colors"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}

  return (
    <>
      <NavBar />
      <main className="w-full bg-[#ede8e2] min-h-screen px-[24px] py-[64px] flex justify-center">
        <div className="bg-white w-full max-w-[480px] rounded-[12px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.14)] border border-[#c2d9cb] flex flex-col"
             style={{ fontFamily: "'Quicksand', sans-serif" }}>
          
          <div className="flex flex-col items-center py-[28px] px-[28px] border-b border-dashed border-[#d4cfc9]">
            <p className="text-[11px] tracking-[2px] uppercase text-[#aaa] mb-[4px]">BloomHero</p>
            <h1 className="font-bold text-[26px] text-[#3f6f52] tracking-[-0.5px]">Bloom Cart</h1>
            <p className="text-[12px] text-[#bbb] mt-[4px]">Your order summary</p>
          </div>

          <div className="flex items-center gap-[12px] px-[28px] pt-[16px] pb-[4px]">
            <div className="w-[48px] shrink-0" />
            <p className="flex-1 text-[11px] tracking-[1.5px] uppercase text-[#aaa]">Item</p>
            <p className="text-[11px] tracking-[1.5px] uppercase text-[#aaa] w-[80px] text-center">Qty</p>
            <p className="text-[11px] tracking-[1.5px] uppercase text-[#aaa] w-[60px] text-right">Total</p>
          </div>

          <DashedDivider />

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
                    onRemove={handleRemove}
                  />
                  {index < cartItems.length - 1 && (
                    <div className="border-t border-dotted border-[#ebe7e2] w-full" />
                  )}
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <>
              <DashedDivider />
              <CartSummary
                cartItems={cartItems}
                onCheckout={handleCheckout}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
