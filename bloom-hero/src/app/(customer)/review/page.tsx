import Footer from "@/components/footer";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { loadReviewPage } from "@/features/reviews/queries/loadReviewPage";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CustomerReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;

  const rawOrderId = params.orderId;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  if (!orderId) {
    return (
      <>
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

  const reviewState = await loadReviewPage(orderId);

  if (reviewState.status === "unauthenticated") {
    return (
      <>
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

  if (reviewState.status !== "ready") {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center bg-[#f5f2eb] px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-[#e2ddd4] px-8 py-10 text-center max-w-md w-full">
            <h1 className="text-xl font-semibold text-[#2f2f2f] mb-2">Review unavailable</h1>
            <p className="text-sm text-gray-700 mb-6">
              We could not load the order details needed for this review.
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

  const { order, existingReview } = reviewState.data;
  const firstItem = order.items[0] ?? null;
  const product = firstItem?.product ?? null;
  const productId = product?.id ?? null;
  const vendorName = order.vendor.shopName;
  const productName = product?.name ?? "Product";
  const productImage = product?.imageUrl ?? null;
  const vendorId = order.vendor.id || null;

  return (
    <>
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
                  {order.orderDate ? new Date(order.orderDate).toLocaleString() : ""}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50">
                Completed
              </span>
            </div>
            {product && (
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#f7f3ec] overflow-hidden shrink-0">
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
                    ₱ {Number(product?.price) || 0} per stem
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-600">
                    {firstItem?.quantity ?? 0}× • ₱ {Number(firstItem?.subtotal) || 0}
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
                  ₱ {Number(product?.price) || 0} per stem
                </p>
              </div>
            </div>

            <ReviewForm
              orderId={orderId}
              vendorId={vendorId}
              productId={productId}
              existingReview={existingReview}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

