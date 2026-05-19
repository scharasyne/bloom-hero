// Source: `src/app/(customer)/_actions/product-actions.ts` (buyNow only)

"use server";

import { addToCart } from "@/features/orders/actions/addToCart";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

/** Adds the product to the cart and sends the customer to checkout. */
export async function buyNow(productId: string, vendorId: string, price: number, quantity: number) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    const result = await addToCart(productId, vendorId, price, quantity);
    if (!result.success) {
      return result;
    }

    return { success: true as const, redirectTo: "/cart" as const };
  } catch (err) {
    console.error("Buy now failed:", err);
    return { success: false, error: "Failed to add to cart. Please try again." };
  }
}
