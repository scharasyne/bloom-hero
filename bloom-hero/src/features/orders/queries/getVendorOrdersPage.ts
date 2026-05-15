// Source: `src/app/(vendor)/_components/VendorOrdersTable.tsx`

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getCachedVendorCommonProfile } from "@/features/vendors/queries/getCachedVendorCommonProfile";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { canManageCatalog } from "@/features/vendors/utils/catalogAccess";

type VendorOrderItemRow = {
  order_id: string;
  quantity: number;
  subtotal: number;
  products: {
    product_name: string;
    product_image_url: string | null;
  } | null;
  orders: {
    id: string;
    customer_id: string;
    order_date: string;
    status: string;
    payment_method: "online" | "cod" | null;
    total_amount: number;
    receipt_proof_url: string | null;
  } | null;
};

export type VendorOrderPageItem = {
  productName: string;
  quantity: number;
  subtotal: number;
};

export type VendorOrderPageOrder = {
  id: string;
  customerId: string;
  orderDate: string;
  status: string;
  paymentMethod: "online" | "cod" | null;
  totalAmount: number;
  receiptSignedUrl: string | null;
  items: VendorOrderPageItem[];
};

export type GetVendorOrdersPageResult =
  | { authenticated: false }
  | { authenticated: true; vendorFound: false }
  | {
      authenticated: true;
      vendorFound: true;
      orders: VendorOrderPageOrder[];
      customerNames: Record<string, string>;
    };

const PAYMENT_PROOF_BUCKET = "order-payment-proofs";

export async function getVendorOrdersPage(
  statusFilter: "to_pay" | "to_ship" | "to_receive" | "all" = "all"
): Promise<GetVendorOrdersPageResult> {
  const user = await getAuthUser();

  if (!user) {
    return { authenticated: false };
  }

  const vendorProfile = await getCachedVendorCommonProfile(user.id);
  if (!vendorProfile || !canManageCatalog(vendorProfile.businessType)) {
    return { authenticated: true, vendorFound: false };
  }

  const supabase = await createSupabaseServerClient();
  const vendor = { id: vendorProfile.vendorId, businessType: vendorProfile.businessType };

  const allowedStatuses = new Set(["to_pay", "to_ship", "to_receive"]);
  const statusList = allowedStatuses.has(statusFilter)
    ? [statusFilter]
    : ["to_pay", "to_ship", "to_receive"];

  const { data: rows } = (await supabase
    .from("order_items")
    .select(
      "order_id, quantity, subtotal, products(product_name, product_image_url), orders!inner(id, customer_id, order_date, status, payment_method, total_amount, receipt_proof_url)"
    )
    .eq("orders.vendor_id", vendor.id)
    .in("orders.status", statusList)) as {
    data: VendorOrderItemRow[] | null;
  };

  const orderRows = rows ?? [];

  const grouped = new Map<
    string,
    {
      id: string;
      customerId: string;
      orderDate: string;
      status: string;
      paymentMethod: "online" | "cod" | null;
      totalAmount: number;
      receiptProofUrl: string | null;
      items: VendorOrderItemRow[];
    }
  >();

  for (const row of orderRows) {
    if (!row.orders) continue;
    const key = row.orders.id;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: row.orders.id,
        customerId: row.orders.customer_id,
        orderDate: row.orders.order_date,
        status: row.orders.status,
        paymentMethod: row.orders.payment_method,
        totalAmount: Number(row.orders.total_amount) || 0,
        receiptProofUrl: row.orders.receipt_proof_url,
        items: [],
      });
    }
    grouped.get(key)!.items.push(row);
  }

  const orders = Array.from(grouped.values()).sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const receiptSignedUrlMap = new Map<string, string>();
  await Promise.all(
    orders.map(async (order) => {
      if (!order.receiptProofUrl) return;
      const { data } = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .createSignedUrl(order.receiptProofUrl, 60 * 60);
      if (data?.signedUrl) {
        receiptSignedUrlMap.set(order.id, data.signedUrl);
      }
    })
  );

  const customerIds = Array.from(new Set(orders.map((order) => order.customerId)));
  let customerNameMap = new Map<string, string>();

  if (customerIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", customerIds);

    customerNameMap = new Map(
      (users ?? []).map((user: { id: string; name: string | null; email: string | null }) => [
        user.id,
        user.name || user.email || "Customer",
      ])
    );
  }

  return {
    authenticated: true,
    vendorFound: true,
    orders: orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      orderDate: order.orderDate,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      receiptSignedUrl: receiptSignedUrlMap.get(order.id) ?? null,
      items: order.items.map((item) => ({
        productName: item.products?.product_name ?? "Product",
        quantity: item.quantity,
        subtotal: Number(item.subtotal || 0),
      })),
    })),
    customerNames: Object.fromEntries(customerNameMap),
  };
}
