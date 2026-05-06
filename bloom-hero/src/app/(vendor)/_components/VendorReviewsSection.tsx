"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Modal } from "@/components/Modal";

export type VendorReviewCard = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  reviewDate: string | null;
  orderId: string | null;
};

export type VendorOrderDetails = {
  id: string;
  status: string;
  orderDate: string;
  totalAmount: number;
  customerName: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    subtotal: number;
    imageUrl: string | null;
  }>;
};

function OrderDetailContent({ details }: { details: VendorOrderDetails }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#2c2a28]">Order Details</h2>
        <p className="text-sm text-[#7a746e]">Order #{details.id}</p>
      </div>

      <div className="rounded-[12px] border border-[#e6e2dd] bg-[#faf8f5] px-4 py-3 space-y-1">
        <div className="flex items-center justify-between text-sm text-[#2c2a28]">
          <span>Status</span>
          <span className="font-semibold">{details.status}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-[#2c2a28]">
          <span>Order date</span>
          <span>{details.orderDate}</span>
        </div>
        {details.customerName ? (
          <div className="flex items-center justify-between text-sm text-[#2c2a28]">
            <span>Customer</span>
            <span>{details.customerName}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {details.items.map((item, index) => (
          <div key={`${item.productName}-${index}`} className="flex items-center gap-3">
            <div className="size-[44px] rounded-[10px] bg-[#f3efe9] overflow-hidden shrink-0">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.productName} className="size-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#2c2a28]">{item.productName}</p>
              <p className="text-xs text-[#7a746e]">Qty {item.quantity}</p>
            </div>
            <div className="text-sm font-semibold text-[#2c2a28]">PHP {item.subtotal.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm font-semibold text-[#2c2a28]">
        <span>Total</span>
        <span>PHP {details.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-[2px] text-[#f5ad2e]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          icon={i <= rating ? "mdi:star" : "mdi:star-outline"}
          width={14}
          height={14}
          className={i <= rating ? "text-[#f5ad2e]" : "text-[#e3dbd2]"}
        />
      ))}
    </span>
  );
}

export function VendorReviewsSection({
  reviews,
  orderDetailsById,
}: {
  reviews: VendorReviewCard[];
  orderDetailsById: Record<string, VendorOrderDetails>;
}) {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const activeOrder = useMemo(
    () => (activeOrderId ? orderDetailsById[activeOrderId] ?? null : null),
    [activeOrderId, orderDetailsById]
  );

  const openOrder = (orderId: string) => {
    setActiveOrderId(orderId);
    setOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setActiveOrderId(null);
  };

  return (
    <section id="reviews" className="mt-14 scroll-mt-20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#262321]">
            Reviews
          </h2>
          <p className="mt-1 text-sm text-[#8d867d]">
            What customers are saying about this shop.
          </p>
        </div>
        <span className="hidden text-xs text-[#8b847c] sm:inline">
          Showing {reviews.length} recent reviews
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#d8d0c7] bg-[#fbf8f4] px-5 py-7 text-sm text-[#7a746e]">
          <p className="font-medium text-[#4a453f]">No reviews yet.</p>
          <p className="mt-1">Customer feedback will appear here once reviews are submitted.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((review) => {
            const reviewDate = review.reviewDate ? new Date(review.reviewDate) : null;
            const orderDetails = review.orderId ? orderDetailsById[review.orderId] : null;

            return (
              <article
                key={review.id}
                className="flex h-full flex-col rounded-2xl border border-[#ece5dd] bg-[#fbf9f6] px-5 py-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7da] text-xs font-semibold text-[#2f5d3a]">
                    {review.customerName.trim().charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2a2724]">
                      {review.customerName}
                    </h3>
                    <p className="text-[11px] text-[#9a9289]">
                      {reviewDate
                        ? reviewDate.toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recently"}
                    </p>
                  </div>
                </div>

                <p className="flex-1 text-sm leading-relaxed text-[#4c4742]">
                  {review.comment?.trim() || "Customer left a rating."}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <StarRating rating={review.rating} />
                  {review.orderId && orderDetails ? (
                    <button
                      type="button"
                      onClick={() => openOrder(review.orderId as string)}
                      className="text-[#8b847c] underline-offset-2 hover:underline"
                    >
                      View details
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal isOpen={orderModalOpen} onCloseAction={closeOrderModal}>
        {activeOrder ? (
          <OrderDetailContent details={activeOrder} />
        ) : (
          <div className="text-sm text-[#7a746e]">No order details available.</div>
        )}
      </Modal>
    </section>
  );
}
