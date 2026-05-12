// Source: `src/app/(customer)/_actions/product-actions.ts` (buyNow only)

"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export async function buyNow(productId: string, vendorId: string, price: number, quantity: number) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      redirect("/login");
    }

    await supabase.from("customers").upsert({ user_id: user.id }, { onConflict: "user_id" });

    const priceValue = Number(price) || 0;
    const { data: newOrder, error: insertOrderError } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        vendor_id: vendorId,
        total_amount: priceValue * quantity,
        status: "completed",
      })
      .select("id")
      .single();

    if (insertOrderError || !newOrder) {
      return { success: false, error: "Unable to place order right now." };
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: newOrder.id,
      product_id: productId,
      quantity,
      subtotal: priceValue * quantity,
    });

    if (itemError) {
      return { success: false, error: "Unable to place order right now." };
    }

    return { success: true };
  } catch (err) {
    console.error("Buy now failed:", err);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}
