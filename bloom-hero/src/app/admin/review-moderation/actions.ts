"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ActionResult<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export type ReviewModerationRecord = {
  id: string;
  rating: number;
  comment: string | null;
  reviewDate: string;
  status: ReviewModerationStatus;
  orderId: string | null;
  customerName: string;
  vendorName: string;
  productName: string;
  productImageUrl: string | null;
};

export type OrderDetails = {
  id: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  vendorName: string;
  customerName: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    subtotal: number;
    imageUrl: string | null;
  }>;
};

type AdminCheckResult =
  | {
      adminId: string;
      error: null;
    }
  | {
      adminId: null;
      error: string;
    };

async function ensureAdmin(): Promise<AdminCheckResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { adminId: null, error: "You must be logged in as an admin." };
  }

  const { data: profile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null }>();

  if (roleError || profile?.role !== "admin") {
    return { adminId: null, error: "Only admins can moderate reviews." };
  }

  return { adminId: user.id, error: null };
}

function getAdminClient(): { client: ReturnType<typeof createSupabaseAdminClient> | null; error?: string } {
  try {
    return { client: createSupabaseAdminClient() };
  } catch (error) {
    console.error("Failed to initialize Supabase admin client:", error);
    return {
      client: null,
      error:
        "Review moderation requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set.",
    };
  }
}

function pickSingle<T extends { [key: string]: any }>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getReviewModerationReviews(): Promise<ActionResult<ReviewModerationRecord[]>> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const { data: reviewRows, error: reviewError } = await adminClient.client
    .from("reviews")
    .select("id, rating, comment, review_date, status, order_id, product_id, customer_id, vendor_id, products(product_name, product_image_url), vendors(shop_name)")
    .order("review_date", { ascending: false });

  if (reviewError) {
    return { ok: false, error: reviewError.message };
  }

  const rows = reviewRows ?? [];
  const customerIds = Array.from(new Set(rows.map((row) => row.customer_id).filter(Boolean)));
  let customerNames = new Map<string, string>();

  if (customerIds.length > 0) {
    const { data: users, error: usersError } = await adminClient.client
      .from("users")
      .select("id, name")
      .in("id", customerIds);

    if (usersError) {
      return { ok: false, error: usersError.message };
    }

    customerNames = new Map((users ?? []).map((user) => [user.id, user.name ?? "Customer"]));
  }

  const reviews: ReviewModerationRecord[] = rows.map((row: any) => {
    const vendor = pickSingle(row.vendors);
    const product = pickSingle(row.products);

    return {
      id: row.id,
      rating: Number(row.rating) || 0,
      comment: row.comment ?? null,
      reviewDate: row.review_date,
      status: (row.status ?? "pending") as ReviewModerationStatus,
      orderId: row.order_id ?? null,
      customerName: customerNames.get(row.customer_id) ?? "Customer",
      vendorName: vendor?.shop_name ?? "Vendor",
      productName: product?.product_name ?? "Product",
      productImageUrl: product?.product_image_url ?? null,
    };
  });

  return { ok: true, data: reviews };
}

export async function updateReviewStatus(
  reviewId: string,
  status: ReviewModerationStatus
): Promise<ActionResult> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const { error } = await adminClient.client
    .from("reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getReviewOrderDetails(orderId: string): Promise<ActionResult<OrderDetails>> {
  const adminCheck = await ensureAdmin();
  if (!adminCheck.adminId) {
    return { ok: false, error: adminCheck.error ?? "You must be logged in as an admin." };
  }

  const adminClient = getAdminClient();
  if (!adminClient.client) {
    return { ok: false, error: adminClient.error };
  }

  const { data: order, error: orderError } = await adminClient.client
    .from("orders")
    .select(
      "id, status, order_date, total_amount, customer_id, vendors(shop_name), order_items(quantity, subtotal, products(product_name, product_image_url))"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Order not found." };
  }

  let customerName: string | null = null;
  if (order.customer_id) {
    const { data: user } = await adminClient.client
      .from("users")
      .select("name")
      .eq("id", order.customer_id)
      .maybeSingle();
    customerName = user?.name ?? null;
  }

  const vendor = pickSingle(order.vendors);
  const items = (order.order_items ?? []).map((item: any) => ({
    productName: item.products?.product_name ?? "Product",
    quantity: Number(item.quantity) || 0,
    subtotal: Number(item.subtotal) || 0,
    imageUrl: item.products?.product_image_url ?? null,
  }));

  return {
    ok: true,
    data: {
      id: order.id,
      status: order.status ?? "unknown",
      orderDate: new Date(order.order_date).toLocaleString(),
      totalAmount: Number(order.total_amount) || 0,
      vendorName: vendor?.shop_name ?? "Vendor",
      customerName,
      items,
    },
  };
}
