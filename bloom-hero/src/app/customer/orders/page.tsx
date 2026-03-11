import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

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
    vendors: {
      id: string | null;
      shop_name: string | null;
    } | null;
  } | null;
};

export default async function CustomerOrdersPage() {
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

  // Fetch completed orders + their items for this customer
  const { data: rows } = await supabase
    .from("order_items")
    .select(
      "order_id, quantity, subtotal, products(id, product_name, price, product_image_url), orders!inner(id, order_date, status, total_amount, vendors(id, shop_name))"
    )
    .eq("orders.customer_id", session.user.id)
    .eq("orders.status", "completed") as { data: OrderItemRow[] | null };

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

            {/* Tabs (static for now, Completed active) */}
            <div className="mt-8 border-b border-[#ebe6dd] flex gap-6 text-sm">
              <button className="pb-3 text-gray-400">To Pay</button>
              <button className="pb-3 text-gray-400">To Ship</button>
              <button className="pb-3 text-gray-400">To Receive</button>
              <button className="pb-3 border-b-2 border-[#2f5d3a] text-[#2f5d3a] font-semibold">
                Completed
              </button>
            </div>
          </div>

          {/* Orders list */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-md border border-dashed border-[#e2ddd4] px-8 py-12 text-center text-sm text-gray-500">
              No completed orders yet. Once you place an order, it will appear here.
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
                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50">
                        Completed
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
                      <p className="text-sm text-gray-600">
                        Total {totalItems} item{totalItems !== 1 ? "s" : ""}:{" "}
                        <span className="font-semibold text-[#2f5d3a]">
                          ₱ {order.total}
                        </span>
                      </p>
                      <div className="flex gap-3 justify-end">
                        {order.hasReview ? (
                          <a
                            href={`/customer/review?orderId=${order.id}`}
                            className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-400 bg-gray-100 inline-flex items-center justify-center cursor-pointer"
                          >
                            View Rating
                          </a>
                        ) : (
                          <a
                            href={`/customer/review?orderId=${order.id}`}
                            className="rounded-full border border-[#f0b4b0] px-4 py-1.5 text-xs font-semibold text-[#c84943] bg-[#fff7f6] inline-flex items-center justify-center"
                          >
                            To Rate
                          </a>
                        )}
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

