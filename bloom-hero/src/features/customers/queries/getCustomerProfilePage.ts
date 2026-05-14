// Source: `src/app/(customer)/profile/page.tsx`

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type {
  CustomerProfilePageResult,
  LinkedVendorCredentials,
} from "@/features/customers/types";

const LINKED_VENDOR_CREDENTIALS_TTL_MS = 48 * 60 * 60 * 1000;

function isLinkedVendorCredentialsActive(issuedAt: string | null | undefined) {
  if (!issuedAt) return false;

  const issuedTime = new Date(issuedAt).getTime();
  if (Number.isNaN(issuedTime)) return false;

  return Date.now() - issuedTime <= LINKED_VENDOR_CREDENTIALS_TTL_MS;
}

export async function getCustomerProfilePage(): Promise<CustomerProfilePageResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { authenticated: false };
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const currentAuthUser = authUser ?? session.user;

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("quantity, orders!inner(status, total_amount, vendor_id)")
    .eq("orders.customer_id", session.user.id)
    .eq("orders.status", "completed");

  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", session.user.id);

  const items = orderItems ?? [];
  const totalStems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalSpent = items.reduce((sum, i) => sum + (Number((i.orders as any)?.total_amount) || 0), 0);
  const uniqueVendors = new Set(items.map(i => (i.orders as any)?.vendor_id).filter(Boolean));
  const orderCount = new Set(items.map(i => (i.orders as any)?.id).filter(Boolean)).size;

  const vendorCounts: Record<string, number> = {};
  items.forEach(i => {
    const vid = (i.orders as any)?.vendor_id;
    if (vid) vendorCounts[vid] = (vendorCounts[vid] || 0) + 1;
  });
  const topVendorId = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  let topVendorName = "None yet";
  if (topVendorId) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("shop_name")
      .eq("id", topVendorId)
      .single();
    topVendorName = vendor?.shop_name ?? "Unknown Shop";
  }

  const user = currentAuthUser;
  const displayName = user.user_metadata?.name ?? "";
  const phone = user.user_metadata?.phone ?? "";
  const linkedVendorCredentials =
    (user.user_metadata?.linked_vendor_credentials as LinkedVendorCredentials | undefined) ?? null;
  const hasLinkedVendorCredentials =
    Boolean(linkedVendorCredentials?.email) &&
    Boolean(linkedVendorCredentials?.password) &&
    isLinkedVendorCredentialsActive(linkedVendorCredentials?.issued_at);

  let shouldShowLinkedVendorCredentials = false;

  if (hasLinkedVendorCredentials && linkedVendorCredentials?.vendor_user_id) {
    try {
      const supabaseAdmin = createSupabaseAdminClient();
      const { data: vendorAuth } = await supabaseAdmin.auth.admin.getUserById(
        linkedVendorCredentials.vendor_user_id
      );

      const vendorMetadata =
        (vendorAuth?.user?.user_metadata as Record<string, unknown> | undefined) ?? {};

      shouldShowLinkedVendorCredentials = Boolean(vendorMetadata.must_change_password);
    } catch {
      shouldShowLinkedVendorCredentials = false;
    }
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  return {
    authenticated: true,
    displayName,
    phone,
    email: user.email ?? "",
    memberSince,
    totalStems,
    totalSpent,
    orderCount,
    uniqueVendorsCount: uniqueVendors.size,
    reviewCount: reviewCount ?? 0,
    topVendorName,
    linkedVendorCredentials,
    shouldShowLinkedVendorCredentials,
  };
}
