// Source: `src/app/actions/order-status.ts`

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { CART_ORDER_STATUS } from "@/features/orders/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { CustomerPayPageResult } from "@/features/orders/types";

export async function loadCustomerPayPage(orderId: string): Promise<CustomerPayPageResult> {
  const user = await getAuthUser();
  if (!user) {
    return { status: "unauthenticated" };
  }

  const supabase = await createSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, customer_id, status, payment_method, receipt_proof_url, receipt_submitted_at")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payment page: ${error.message}`);
  }

  if (!order || order.status === CART_ORDER_STATUS) {
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
