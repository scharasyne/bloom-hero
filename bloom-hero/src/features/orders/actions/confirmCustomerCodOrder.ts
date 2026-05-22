"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getOrderSessionUserId } from "@/features/orders/utils/getOrderSessionUserId";

export async function confirmCustomerCodOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    redirect("/orders?tab=to-pay&error=Invalid+order");
  }

  try {
    const { supabase, userId } = await getOrderSessionUserId();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, status, payment_method")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found.");
    }

    if (order.customer_id !== userId) {
      throw new Error("You are not allowed to update this order.");
    }

    if (order.status !== "to_pay" || order.payment_method !== "cod") {
      throw new Error("Only cash-on-delivery orders awaiting confirmation can be submitted.");
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "to_ship" })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    revalidatePath("/vendor/orders");
    redirect("/orders?tab=to-ship&success=Order+confirmed");
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update+failed";
    redirect(`/orders?tab=to-pay&error=${message}`);
  }
}
