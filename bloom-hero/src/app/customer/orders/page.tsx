import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { markOrderReceived, uploadOrderReceiptProof } from "@/app/actions/order-status";

type OrderTab = "to_pay" | "to_ship" | "to_receive" | "completed";

type PageProps = {
  searchParams: Promise<{ tab?: string; success?: string; error?: string }>;
};

type OrderItemRow = {
  order_id: string;
  quantity: number;
  subtotal: number;
  products: {
    product_name: string;
    price: number;
    product_image_url: string | null;
  } | null;
  orders: {
    id: string;
    order_date: string;
    status: string;
    total_amount: number;
    payment_method: "online" | "cod" | null;
    receipt_proof_url: string | null;
    payment_confirmed_at: string | null;
    shipped_at: string | null;
    received_at: string | null;
    vendors: {
      id: string | null;
      shop_name: string | null;
    } | null;
  } | null;
};

const tabConfig: Record<OrderTab, { label: string; statuses: string[]; badgeClass: string }> = {
  to_pay: {
    label: "To Pay",
    statuses: ["to_pay"],
    badgeClass: "text-amber-700 border-amber-200 bg-amber-50",
  },
  to_ship: {
    label: "To Ship",
    statuses: ["to_ship"],
    badgeClass: "text-indigo-700 border-indigo-200 bg-indigo-50",
  },
  to_receive: {
    label: "To Receive",
    statuses: ["to_receive"],
    badgeClass: "text-sky-700 border-sky-200 bg-sky-50",
  },
  completed: {
    label: "Completed",
    statuses: ["completed"],
    badgeClass: "text-emerald-700 border-emerald-200 bg-emerald-50",
  },
};

export default async function CustomerOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedTab = params.tab;
  const activeTab: OrderTab =
    requestedTab === "to_pay" ||
    requestedTab === "to_ship" ||
    requestedTab === "to_receive" ||
    requestedTab === "completed"
      ? requestedTab
      : "completed";

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Let middleware / login page handle this normally
    return (
      <>
        <NavBar />
        <main className="min-h-screen flex items-center justify-center bg-[#f5f2eb] px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 px-8 py-10 text-center max-w-md w-full">
            <h1 className="text-xl font-semibold text-red-600 mb-2">Please sign in</h1>
            <p className="text-sm text-gray-700 mb-6">
              You need to be logged in to view your purchase history.
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[#2f5d3a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#25492e]"
            >
              Go to login
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const selectedStatuses = tabConfig[activeTab].statuses;

  // Fetch orders for this customer based on active tab.
  const { data: rows } = await supabase
    .from("order_items")
    .select(
      "order_id, quantity, subtotal, products(id, product_name, price, product_image_url), orders!inner(id, order_date, status, total_amount, payment_method, receipt_proof_url, payment_confirmed_at, shipped_at, received_at, vendors(id, shop_name))"
    )
    .eq("orders.customer_id", session.user.id)
    .in("orders.status", selectedStatuses) as { data: OrderItemRow[] | null };

  const items = rows ?? [];

  // Group by order, then by vendor (each order already has a single vendor)
  const ordersMap = new Map<
    string,
    {
      id: string;
      vendorId: string | null;
      vendorName: string;
      status: string;
      orderDate: string;
      total: number;
      paymentMethod: "online" | "cod" | null;
      receiptProofUrl: string | null;
      paymentConfirmedAt: string | null;
      shippedAt: string | null;
      receivedAt: string | null;
      items: OrderItemRow[];
      hasReview: boolean;
    }
  >();
  for (const row of items) {
    if (!row.orders) continue;
    const key = row.orders.id;
    if (!ordersMap.has(key)) {
      ordersMap.set(key, {
        id: row.order_id,
        vendorId: row.orders.vendors?.id ?? null,
        vendorName: row.orders.vendors?.shop_name ?? "Bloom & Co.",
        status: row.orders.status,
        orderDate: row.orders.order_date,
        total: Number(row.orders.total_amount) || 0,
        paymentMethod: row.orders.payment_method,
        receiptProofUrl: row.orders.receipt_proof_url,
        paymentConfirmedAt: row.orders.payment_confirmed_at,
        shippedAt: row.orders.shipped_at,
        receivedAt: row.orders.received_at,
        items: [],
        hasReview: false,
      });
    }
    ordersMap.get(key)!.items.push(row);
  }

  // Look up which vendors already have reviews from this customer
  const ordersArray = Array.from(ordersMap.values());
  const vendorIds = Array.from(
    new Set(
      ordersArray
        .map((o) => o.vendorId)
        .filter((v): v is string => Boolean(v))
    )
  );

  let reviewedVendors = new Set<string>();
  if (vendorIds.length > 0) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("vendor_id")
      .eq("customer_id", session.user.id)
      .in("vendor_id", vendorIds);

    reviewedVendors = new Set((reviews ?? []).map((r: any) => r.vendor_id));
  }

  const orders = ordersArray
    .map((o) => ({
      ...o,
      hasReview: o.vendorId ? reviewedVendors.has(o.vendorId) : false,
    }))
    .sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#f5f2eb] px-4 py-10 flex justify-center">
        <div className="w-full max-w-5xl">
          {/* Header / profile strip */}
          <div className="bg-white rounded-3xl shadow-md border border-[#e2ddd4] px-8 py-10 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs text-gray-500">
                  You are signed in as{" "}
                  <span className="font-semibold text-[#2f5d3a]">
                    {session.user.user_metadata?.name ?? session.user.email}
                  </span>
                </p>
                <h1 className="mt-4 text-2xl md:text-3xl font-bold text-[#2f2f2f]">
                  Purchase History
                </h1>
                {params.success ? (
                  <p className="mt-2 text-sm text-emerald-700">{params.success}</p>
                ) : null}
                {params.error ? (
                  <p className="mt-2 text-sm text-red-600">{params.error}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full bg-[#f1eee8] flex items-center justify-center text-gray-400 text-4xl">
                  {/* simple avatar placeholder */}
                  <span>👤</span>
                </div>
                <p className="text-sm font-medium text-[#2f2f2f]">
                  {session.user.user_metadata?.name ?? "Customer"}
                </p>
              </div>
            </div>

            {/* Order status tabs */}
            <div className="mt-8 border-b border-[#ebe6dd] flex gap-6 text-sm">
              {(Object.keys(tabConfig) as OrderTab[]).map((tab) => (
                <a
                  key={tab}
                  href={`/customer/orders?tab=${tab}`}
                  className={`pb-3 ${
                    tab === activeTab
                      ? "border-b-2 border-[#2f5d3a] text-[#2f5d3a] font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {tabConfig[tab].label}
                </a>
              ))}
            </div>
          </div>

          {/* Orders list */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-md border border-dashed border-[#e2ddd4] px-8 py-12 text-center text-sm text-gray-500">
              No {tabConfig[activeTab].label.toLowerCase()} orders yet.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => {
                const totalItems = order.items.reduce(
                  (sum, it) => sum + (it.quantity || 0),
                  0
                );

                return (
                  <section
                    key={idx}
                    className="bg-white rounded-3xl shadow-md border border-[#e2ddd4] px-6 py-5"
                  >
                    {/* Vendor header */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-[#2f2f2f]">
                          {order.vendorName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.orderDate).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tabConfig[activeTab].badgeClass}`}
                      >
                        {tabConfig[activeTab].label}
                      </span>
                    </div>

                    {/* Items list */}
                    <div className="divide-y divide-[#f1ece4]">
                      {order.items.map((row, i) => {
                        const product = row.products;
                        if (!product) return null;
                        return (
                          <div key={i} className="flex items-center gap-4 py-3">
                            <div className="h-14 w-14 rounded-full bg-[#f7f3ec] overflow-hidden flex-shrink-0">
                              {product.product_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.product_image_url}
                                  alt={product.product_name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#2f2f2f]">
                                {product.product_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₱ {Number(product.price) || 0} per stem
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-600">
                                {row.quantity}× • ₱ {Number(row.subtotal) || 0}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer with totals & actions */}
                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        <p>
                          Total {totalItems} item{totalItems !== 1 ? "s" : ""}: {" "}
                          <span className="font-semibold text-[#2f5d3a]">₱ {order.total}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                        </p>
                      </div>
                      <div className="flex gap-3 justify-end">
                        {activeTab === "to_pay" && order.paymentMethod === "online" ? (
                          <form action={uploadOrderReceiptProof} encType="multipart/form-data" className="flex flex-col gap-2">
                            <input type="hidden" name="orderId" value={order.id} />
                            <input
                              type="file"
                              name="receipt"
                              accept="image/*"
                              required
                              className="rounded-md border border-[#ddd] p-1 text-xs"
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-[#f0b4b0] px-4 py-1.5 text-xs font-semibold text-[#c84943] bg-[#fff7f6]"
                            >
                              Upload Receipt
                            </button>
                          </form>
                        ) : null}

                        {activeTab === "to_receive" ? (
                          <form action={markOrderReceived}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-[#2f5d3a] px-4 py-1.5 text-xs font-semibold text-white bg-[#2f5d3a] hover:bg-[#26492f]"
                            >
                              Mark as Received
                            </button>
                          </form>
                        ) : null}

                        {activeTab === "completed"
                          ? order.hasReview
                            ? (
                              <a
                                href={`/customer/review?orderId=${order.id}`}
                                className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-100 inline-flex items-center justify-center cursor-pointer"
                              >
                                View Rating
                              </a>
                            )
                            : (
                              <a
                                href={`/customer/review?orderId=${order.id}`}
                                className="rounded-full border border-[#f0b4b0] px-4 py-1.5 text-xs font-semibold text-[#c84943] bg-[#fff7f6] inline-flex items-center justify-center"
                              >
                                To Rate
                              </a>
                            )
                          : null}
                        <button className="rounded-full border border-[#2f5d3a] px-4 py-1.5 text-xs font-semibold text-white bg-[#2f5d3a] hover:bg-[#26492f]">
                          Buy Again
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

