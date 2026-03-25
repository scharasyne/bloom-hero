import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  vendorConfirmPayment,
  vendorMarkAsShipped,
} from "@/app/actions/order-status";

type VendorOrdersTableProps = {
  vendorType: "market" | "pop-up";
  successMessage?: string;
  errorMessage?: string;
};

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

export default async function VendorOrdersTable({
  vendorType,
  successMessage,
  errorMessage,
}: VendorOrdersTableProps) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="rounded-xl border border-red-100 bg-white p-6 text-sm text-red-600">
        Please sign in as a vendor to view orders.
      </div>
    );
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", session.user.id)
    .eq("vendor_type", vendorType)
    .maybeSingle();

  if (!vendor) {
    return (
      <div className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-700">
        Vendor profile not found for this dashboard.
      </div>
    );
  }

  const { data: rows } = await supabase
    .from("order_items")
    .select(
      "order_id, quantity, subtotal, products(product_name, product_image_url), orders!inner(id, customer_id, order_date, status, payment_method, total_amount, receipt_proof_url)"
    )
    .eq("orders.vendor_id", vendor.id)
    .in("orders.status", ["to_pay", "to_ship", "to_receive"]) as {
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

  const customerIds = Array.from(new Set(orders.map((o) => o.customerId)));
  let customerNameMap = new Map<string, string>();

  if (customerIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", customerIds);

    customerNameMap = new Map(
      (users ?? []).map((u: any) => [u.id, u.name || u.email || "Customer"])
    );
  }

  return (
    <div className="space-y-4">
      {successMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d8d5d0] bg-white px-6 py-8 text-sm text-gray-500">
          No active orders yet.
        </div>
      ) : (
        orders.map((order) => {
          const statusLabel =
            order.status === "to_pay"
              ? "To Pay"
              : order.status === "to_ship"
                ? "To Ship"
                : "To Receive";

          return (
            <section
              key={order.id}
              className="rounded-2xl border border-[#e4ded7] bg-white px-6 py-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#2f2f2f]">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Customer: {customerNameMap.get(order.customerId) ?? "Customer"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[#dad5cc] bg-[#f7f4ef] px-3 py-1 text-xs font-semibold text-[#5f5a55]">
                  {statusLabel}
                </span>
              </div>

              <div className="space-y-2 border-y border-[#f1ece5] py-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                    <p className="text-[#333]">{item.products?.product_name ?? "Product"}</p>
                    <p className="text-gray-500">
                      {item.quantity}x • ₱{Number(item.subtotal || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                  </p>
                  <p className="text-sm font-semibold text-[#2f5d3a]">
                    Total: ₱{order.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.status === "to_pay" && order.paymentMethod === "online" ? (
                    <>
                      {order.receiptProofUrl ? (
                        <a
                          href={order.receiptProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[#dad5cc] px-3 py-1.5 text-xs font-semibold text-[#5f5a55]"
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span className="rounded-full border border-[#f3d8d8] bg-[#fff8f8] px-3 py-1.5 text-xs text-[#cc6d6d]">
                          Waiting for receipt
                        </span>
                      )}

                      <form action={vendorConfirmPayment}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <button
                          type="submit"
                          disabled={!order.receiptProofUrl}
                          className="rounded-full border border-[#2f5d3a] bg-[#2f5d3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#25492e] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm Payment
                        </button>
                      </form>
                    </>
                  ) : null}

                  {order.status === "to_ship" ? (
                    <form action={vendorMarkAsShipped}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[#2f5d3a] bg-[#2f5d3a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#25492e]"
                      >
                        Mark as Shipped
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
