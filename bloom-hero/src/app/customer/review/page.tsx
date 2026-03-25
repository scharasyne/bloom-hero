import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CustomerReviewPage({ searchParams }: ReviewPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const params = await searchParams;

  if (!session) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen flex items-center justify-center bg-[#f5f2eb] px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 px-8 py-10 text-center max-w-md w-full">
            <h1 className="text-xl font-semibold text-red-600 mb-2">Please sign in</h1>
            <p className="text-sm text-gray-700 mb-6">
              You need to be logged in to leave a review.
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

  const rawOrderId = params.orderId;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  if (!orderId) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen flex items-center justify-center bg-[#f5f2eb] px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 px-8 py-10 text-center max-w-md w-full">
            <h1 className="text-xl font-semibold text-amber-700 mb-2">No order selected</h1>
            <p className="text-sm text-gray-700 mb-6">
              Go back to your purchase history to choose an order to rate.
            </p>
            <a
              href="/customer/orders"
              className="inline-flex items-center justify-center rounded-full bg-[#2f5d3a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#25492e]"
            >
              Back to Purchase History
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Load all items for this order belonging to the logged-in customer
  const { data: rows, error: loadError } = await supabase
    .from("order_items")
    .select(
      "order_id, quantity, subtotal, products(id, product_name, price, product_image_url), orders!inner(id, customer_id, order_date, vendors(id, shop_name))"
    )
    .eq("orders.id", orderId)
    .eq("orders.customer_id", session.user.id);

  if (loadError) {
    console.error("Failed to load order for review:", loadError);
  }

  const items = rows ?? [];
  const first = items[0];
  const order = Array.isArray(first?.orders) ? first.orders[0] : first?.orders;
  const vendor = Array.isArray(order?.vendors) ? order.vendors[0] : order?.vendors;
  const product = Array.isArray(first?.products) ? first.products[0] : first?.products;

  const vendorName = vendor?.shop_name ?? "Vendor";
  const productName = product?.product_name ?? "Product";
  const productImage = product?.product_image_url ?? null;
  const vendorId = vendor?.id ?? null;

  // Load existing review (if any) for this vendor & customer
  let existingReview: { id: string; rating: number; comment: string | null } | null =
    null;
  if (vendorId) {
    const { data: review } = await supabase
      .from("reviews")
      .select("id, rating, comment")
      .eq("customer_id", session.user.id)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    existingReview = review ?? null;
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#f5f2eb] px-4 py-10 flex justify-center">
        <div className="w-full max-w-5xl flex flex-col items-center gap-8">
          {/* Top summary card like in history */}
          <section className="w-full bg-white rounded-3xl shadow-md border border-[#e2ddd4] px-6 py-5 max-w-2xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-[#2f2f2f]">
                  {vendorName}
                </p>
                <p className="text-xs text-gray-400">
                  {order?.order_date
                    ? new Date(order.order_date).toLocaleString()
                    : ""}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50">
                Completed
              </span>
            </div>
            {first && product && (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#f7f3ec] overflow-hidden flex-shrink-0">
                  {productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productImage}
                      alt={productName}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2f2f2f]">
                    {productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₱ {Number(product.price) || 0} per stem
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-600">
                    {first.quantity}× • ₱ {Number(first.subtotal) || 0}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Review card */}
          <section className="bg-white rounded-3xl shadow-md border border-[#e2ddd4] px-10 py-8 max-w-2xl w-full">
            <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 mb-3">
              REVIEW YOUR PURCHASE
            </p>
            <h2 className="text-2xl font-bold text-[#2f2f2f] mb-6">{vendorName}</h2>

            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="h-24 w-24 rounded-full bg-[#f7f3ec] overflow-hidden">
                {productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-[#2f2f2f]">
                  {productName}
                </p>
                <p className="text-xs text-gray-500">
                  ₱ {product ? Number(product.price) || 0 : 0} per stem
                </p>
              </div>
            </div>

            <ReviewForm
              orderId={orderId}
              vendorId={vendorId}
              customerId={session.user.id}
              existingReview={existingReview}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

