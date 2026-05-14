// Source: `src/app/actions/order-status.ts`

"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { getOrderSessionUserId } from "@/features/orders/utils/getOrderSessionUserId";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const PAYMENT_PROOF_BUCKET = "order-payment-proofs";

export async function uploadOrderReceiptProof(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const file = formData.get("receipt") as File | null;

  if (!orderId || !file || file.size === 0) {
    redirect("/orders?tab=to-pay&error=Missing+receipt+upload");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    redirect("/orders?tab=to-pay&error=Only+JPEG+and+PNG+images+are+accepted");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    redirect("/orders?tab=to-pay&error=File+size+must+be+under+5+MB");
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
      throw new Error("You are not allowed to upload receipt for this order.");
    }

    if (order.status !== "to_pay" || order.payment_method !== "online") {
      throw new Error("This order is not waiting for online payment.");
    }

    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${orderId}/${userId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PAYMENT_PROOF_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        receipt_proof_url: filePath,
        receipt_submitted_at: new Date().toISOString(),
        status: "to_ship",
      })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    revalidatePath("/market/orders");
    revalidatePath("/pop-up/orders");
    redirect("/orders?tab=to-ship&success=Receipt+uploaded");
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Upload+failed";
    redirect(`/orders?tab=to-pay&error=${message}`);
  }
}
