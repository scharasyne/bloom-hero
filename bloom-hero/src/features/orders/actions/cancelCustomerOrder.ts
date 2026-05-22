// Source: `src/app/actions/order-status.ts`

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getOrderSessionUserId } from "@/features/orders/utils/getOrderSessionUserId";

export async function cancelCustomerOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    redirect("/orders?tab=to-pay&error=Invalid+order");
  }

  try {
    const { supabase, userId } = await getOrderSessionUserId();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found.");
    }

    if (order.customer_id !== userId) {
      throw new Error("You are not allowed to cancel this order.");
    }

    if (order.status !== "to_pay") {
      throw new Error("Only orders awaiting payment can be cancelled.");
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    revalidatePath("/vendor/orders");
    redirect("/orders?tab=to-pay&success=Order+cancelled");
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update+failed";
    redirect(`/orders?tab=to-pay&error=${message}`);
  }
}
