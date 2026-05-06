"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const PAYMENT_PROOF_BUCKET = "order-payment-proofs";

type VendorScopedOrder = {
  id: string;
  vendor_id: string;
  status: string;
  payment_method?: "online" | "cod" | null;
  receipt_proof_url?: string | null;
  vendors: { owner_id: string; vendor_type: string } | null;
};

export type CustomerPayPageResult =
  | { status: "unauthenticated" }
  | { status: "not-found" }
  | {
      status: "ready";
      order: {
        id: string;
        status: string;
        paymentMethod: string | null;
        receiptProofUrl: string | null;
        receiptSubmittedAt: string | null;
      };
    };

async function getSessionUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error("Please sign in to continue.");
  }

  return { supabase, userId: session.user.id };
}

async function getVendorScopedOrder(
  orderId: string,
  ownerId: string,
  selectClause: string
) {
  const supabase = await createSupabaseServerClient();
  const select =
    selectClause === "id, vendor_id, status, payment_method, receipt_proof_url"
      ? ("id, vendor_id, status, payment_method, receipt_proof_url, vendors!inner(owner_id, vendor_type)" as const)
      : ("id, vendor_id, status, vendors!inner(owner_id, vendor_type)" as const);
  const { data, error } = await supabase
    .from("orders")
    .select(select)
    .eq("id", orderId)
    .eq("vendors.owner_id", ownerId)
    .single();

  if (error || !data) {
    throw new Error("Order not found.");
  }

  return { supabase, order: data as unknown as VendorScopedOrder };
}

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
    const { supabase, userId } = await getSessionUserId();

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
        // Store the private storage path instead of a public URL.
        receipt_proof_url: filePath,
        receipt_submitted_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    revalidatePath("/vendor/market/orders");
    revalidatePath("/vendor/pop-up/orders");
    redirect("/orders?tab=to-pay&success=Receipt+uploaded");
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Upload+failed";
    redirect(`/orders?tab=to-pay&error=${message}`);
  }
}

export async function markOrderReceived(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    redirect("/orders?tab=to-receive&error=Invalid+order");
  }

  try {
    const { supabase, userId } = await getSessionUserId();

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

export async function cancelCustomerOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    redirect("/orders?tab=to-pay&error=Invalid+order");
  }

  try {
    const { supabase, userId } = await getSessionUserId();

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

    if (!["pending", "to_pay"].includes(order.status)) {
      throw new Error("Only unpaid orders can be cancelled.");
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
    revalidatePath("/vendor/market/orders");
    revalidatePath("/vendor/pop-up/orders");
    redirect("/orders?tab=to-pay&success=Order+cancelled");
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update+failed";
    redirect(`/orders?tab=to-pay&error=${message}`);
  }
}

export async function loadCustomerPayPage(orderId: string): Promise<CustomerPayPageResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return { status: "unauthenticated" };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, customer_id, status, payment_method, receipt_proof_url, receipt_submitted_at")
    .eq("id", orderId)
    .eq("customer_id", session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment page: ${error.message}`);
  }

  if (!order) {
    return { status: "not-found" };
  }

  return {
    status: "ready",
    order: {
      id: order.id,
      status: order.status,
      paymentMethod: order.payment_method,
      receiptProofUrl: order.receipt_proof_url,
      receiptSubmittedAt: order.receipt_submitted_at,
    },
  };
}


export async function vendorConfirmPayment(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  let vendorRoute = "/vendor/market/orders";

  if (!orderId) {
    redirect("/vendor/market/orders?error=Invalid+order");
  }

  try {
    const { userId } = await getSessionUserId();
    const { supabase, order } = await getVendorScopedOrder(
      orderId,
      userId,
      "id, vendor_id, status, payment_method, receipt_proof_url"
    );

    if (!order.vendors) {
      throw new Error("You are not allowed to confirm this payment.");
    }
    vendorRoute = `/vendor/${order.vendors.vendor_type}/orders`;

    if (order.status !== "to_pay" || order.payment_method !== "online") {
      throw new Error("Only online orders in To Pay can be confirmed.");
    }

    if (!order.receipt_proof_url) {
      throw new Error("Customer has not uploaded a receipt yet.");
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "to_ship",
        payment_confirmed_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/vendor/market/orders");
    revalidatePath("/vendor/pop-up/orders");
    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    redirect(`${vendorRoute}?success=Payment+confirmed`);
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update+failed";
    redirect(`${vendorRoute}?error=${message}`);
  }
}

export async function vendorMarkAsShipped(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  let vendorRoute = "/vendor/market/orders";

  if (!orderId) {
    redirect("/vendor/market/orders?error=Invalid+order");
  }

  try {
    const { userId } = await getSessionUserId();
    const { supabase, order } = await getVendorScopedOrder(
      orderId,
      userId,
      "id, vendor_id, status"
    );

    if (!order.vendors) {
      throw new Error("You are not allowed to update this order.");
    }
    vendorRoute = `/vendor/${order.vendors.vendor_type}/orders`;

    if (order.status !== "to_ship") {
      throw new Error("Only To Ship orders can be marked shipped.");
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "to_receive", shipped_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/vendor/market/orders");
    revalidatePath("/vendor/pop-up/orders");
    revalidatePath("/orders");
    revalidatePath("/customer/orders");
    redirect(`${vendorRoute}?success=Order+marked+as+shipped`);
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? encodeURIComponent(error.message) : "Update+failed";
    redirect(`${vendorRoute}?error=${message}`);
  }
}
