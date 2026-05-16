// Source: `src/app/actions/order-status.ts`

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getOrderSessionUserId } from "@/features/orders/utils/getOrderSessionUserId";

export async function markOrderReceived(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    redirect("/orders?tab=to-receive&error=Invalid+order");
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
      throw new Error("You are not allowed to update this order.");
    }

    if (order.status !== "to_receive") {
      throw new Error("Only orders waiting to receive can be completed.");
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed", received_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    redirect("/orders?tab=completed&success=Order+completed");
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update+failed";
    redirect(`/orders?tab=to-receive&error=${message}`);
  }
}
