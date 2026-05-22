// Source: `src/app/(customer)/_actions/product-actions.ts` (addToCart only)

"use server";

import { CART_ORDER_STATUS } from "@/features/orders/constants";
import { resolveCartProductPrice } from "@/features/orders/utils/resolveCartProductPrice";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export async function addToCart(productId: string, vendorId: string, _price: number, quantity: number) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      redirect("/login");
    }

    await supabase.from("customers").upsert({ user_id: user.id }, { onConflict: "user_id" });

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { success: false, error: "Invalid quantity." };
    }

    const resolvedPrice = await resolveCartProductPrice(supabase, productId, vendorId);
    if (!resolvedPrice.ok) {
      return { success: false, error: resolvedPrice.error };
    }
    const priceValue = resolvedPrice.price;

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("customer_id", user.id)
      .eq("vendor_id", vendorId)
      .eq("status", CART_ORDER_STATUS)
      .maybeSingle();

    let orderId: string;
    let currentTotal = 0;

    if (existingOrder) {
      orderId = existingOrder.id;
      currentTotal = Number(existingOrder.total_amount) || 0;
    } else {
      const { data: newOrder, error: insertOrderError } = await supabase
        .from("orders")
        .insert({ customer_id: user.id, vendor_id: vendorId, total_amount: 0 })
        .select("id, total_amount")
        .single();

      if (insertOrderError || !newOrder) {
        return { success: false, error: "Failed to create order." };
      }
      orderId = newOrder.id;
    }

    const { data: existingItem } = await supabase
      .from("order_items")
      .select("id, quantity, subtotal")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingItem) {
      const newQty = (existingItem.quantity || 0) + quantity;
      const newSubtotal = priceValue * newQty;
      await supabase.from("order_items").update({ quantity: newQty, subtotal: newSubtotal }).eq("id", existingItem.id);
    } else {
      await supabase.from("order_items").insert({
        order_id: orderId,
        product_id: productId,
        quantity,
        subtotal: priceValue * quantity,
      });
    }

    await supabase.from("orders").update({ total_amount: currentTotal + priceValue * quantity }).eq("id", orderId);

    return { success: true };
  } catch (err) {
    console.error("Add to cart failed:", err);
    return { success: false, error: "Failed to add to cart. Please try again." };
  }
}
