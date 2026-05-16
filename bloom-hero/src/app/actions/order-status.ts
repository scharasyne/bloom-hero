"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getRegisteredVendorCatalogAccess } from "@/features/vendors/queries/getRegisteredVendorCatalogAccess";

type VendorScopedOrder = {
  id: string;
  vendor_id: string;
  status: string;
  payment_method?: "online" | "cod" | null;
  receipt_proof_url?: string | null;
  vendors: { owner_id: string } | null;
};

async function getSessionUserId() {
  const supabase = await createSupabaseServerClient();
  const user = await getAuthUser();

  if (!user?.id) {
    throw new Error("Please sign in to continue.");
  }

  return { supabase, userId: user.id };
}

async function getVendorScopedOrder(
  orderId: string,
  ownerId: string,
  selectClause: string
) {
  const supabase = await createSupabaseServerClient();
  const select =
    selectClause === "id, vendor_id, status, payment_method, receipt_proof_url"
      ? ("id, vendor_id, status, payment_method, receipt_proof_url, vendors!inner(owner_id)" as const)
      : ("id, vendor_id, status, vendors!inner(owner_id)" as const);
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

export async function vendorConfirmPayment(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  let vendorRoute = "/vendor/orders";

  if (!orderId) {
    redirect("/vendor/orders?error=Invalid+order");
  }

  try {
    const catalogAccess = await getRegisteredVendorCatalogAccess();
    if (!catalogAccess.ok) {
      throw new Error("Only registered businesses can manage orders.");
    }

    const { userId } = await getSessionUserId();
    const { supabase, order } = await getVendorScopedOrder(
      orderId,
      userId,
      "id, vendor_id, status, payment_method, receipt_proof_url"
    );

    if (!order.vendors) {
      throw new Error("You are not allowed to confirm this payment.");
    }
    vendorRoute = "/vendor/orders";

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

    revalidatePath("/vendor/orders");
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
  let vendorRoute = "/vendor/orders";

  if (!orderId) {
    redirect("/vendor/orders?error=Invalid+order");
  }

  try {
    const catalogAccess = await getRegisteredVendorCatalogAccess();
    if (!catalogAccess.ok) {
      throw new Error("Only registered businesses can manage orders.");
    }

    const { userId } = await getSessionUserId();
    const { supabase, order } = await getVendorScopedOrder(
      orderId,
      userId,
      "id, vendor_id, status"
    );

    if (!order.vendors) {
      throw new Error("You are not allowed to update this order.");
    }
    vendorRoute = "/vendor/orders";

    if (order.status !== "to_ship") {
      throw new Error("Only To Ship orders can be marked shipped.");
    }

    const { data: itemRows, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      throw itemsError;
    }

    const quantityByProduct = new Map<string, number>();
    for (const item of itemRows ?? []) {
      if (!item.product_id) continue;
      const currentQty = quantityByProduct.get(item.product_id) ?? 0;
      quantityByProduct.set(item.product_id, currentQty + (Number(item.quantity) || 0));
    }

    if (quantityByProduct.size > 0) {
      const productIds = Array.from(quantityByProduct.keys());
      const { data: productRows, error: productsError } = await supabase
        .from("products")
        .select("id, stocks")
        .in("id", productIds);

      if (productsError) {
        throw productsError;
      }

      const stockMap = new Map(
        (productRows ?? []).map((row) => [row.id, Number(row.stocks) || 0])
      );

      const updateResults = await Promise.all(
        productIds.map((productId) => {
          const currentStock = stockMap.get(productId) ?? 0;
          const nextStock = Math.max(0, currentStock - (quantityByProduct.get(productId) ?? 0));
          return supabase
            .from("products")
            .update({ stocks: nextStock })
            .eq("id", productId);
        })
      );

      for (const result of updateResults) {
        if (result.error) {
          throw result.error;
        }
      }
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "to_receive", shipped_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/vendor/orders");
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
