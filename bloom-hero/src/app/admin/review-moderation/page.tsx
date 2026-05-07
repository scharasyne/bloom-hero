"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Modal } from "@/components/Modal";
import {
  getReviewModerationReviews,
  getReviewOrderDetails,
  updateReviewStatus,
  type ReviewModerationRecord,
  type ReviewModerationStatus,
  type OrderDetails,
} from "./actions";

type ReviewTab = ReviewModerationStatus;

const PAGE_SIZE = 5;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          icon={i <= rating ? "mdi:star" : "mdi:star-outline"}
          width={14} height={14}
          className={i <= rating ? "text-[#e0a82e]" : "text-[#d1ccc7]"}
        />
      ))}
      <span className="ml-[4px] text-[13px] text-[#7a746e]">{rating.toFixed(1)}</span>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] p-[20px] flex flex-col gap-[14px] animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex gap-[12px] items-center">
          <div className="size-[44px] rounded-full bg-[#e6e2dd] shrink-0" />
          <div className="flex flex-col gap-[8px]">
            <div className="h-[20px] w-[260px] rounded-[8px] bg-[#e6e2dd]" />
            <div className="h-[16px] w-[140px] rounded-[8px] bg-[#e6e2dd]" />
          </div>
        </div>
        <div className="size-[24px] rounded-[6px] bg-[#e6e2dd]" />
      </div>
      <div className="bg-[#e6e2dd] h-px w-full" />
      <div className="h-[18px] w-[320px] rounded-[8px] bg-[#e6e2dd]" />
      <div className="h-[18px] w-[220px] rounded-[8px] bg-[#e6e2dd]" />
      <div className="flex gap-[10px]">
        <div className="h-[44px] w-[110px] rounded-[12px] bg-[#e6e2dd]" />
        <div className="h-[44px] w-[90px] rounded-[12px] bg-[#e6e2dd]" />
        <div className="h-[44px] w-[120px] rounded-[12px] bg-[#e6e2dd]" />
      </div>
    </div>
  );
}

function formatReviewDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortOrderId(orderId: string | null) {
  if (!orderId) return null;
  const [shortId] = orderId.split("-");
  return shortId || orderId;
}

function ReviewCard({
  review,
  onApprove,
  onReject,
  onViewOrder,
  isUpdating,
}: {
  review: ReviewModerationRecord;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewOrder: (orderId: string) => void;
  isUpdating: boolean;
}) {
  const orderLabel = shortOrderId(review.orderId);

  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px]">

      {/* Header */}
      <div className="flex items-start justify-between w-full">
        <div className="flex gap-[12px] items-center">
          <div className="size-[44px] rounded-full bg-[#e6e2dd] flex items-center justify-center shrink-0 overflow-hidden">
            <Icon icon="mdi:account-outline" width={24} height={24} className="text-[#7a746e]" />
          </div>

          <div>
            <div className="flex items-center gap-[8px] flex-wrap">
              <span className="font-semibold text-[15px] text-[#2c2a28]">{review.customerName}</span>
              <span className="text-[#b8b2ab]">-&gt;</span>
              <span className="font-semibold text-[15px] text-[#2c2a28]">{review.vendorName}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-[13px] text-[#7a746e] mt-[2px]">
              Posted: {formatReviewDate(review.reviewDate)}
            </p>
            <p className="text-[13px] text-[#7a746e] mt-[2px]">
              Product: {review.productName}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#e6e2dd] h-px w-full" />

      <p className="text-[14px] text-[#2c2a28] leading-[22px]">
        "{review.comment || "No comment provided."}"
      </p>

      <div className="flex items-center gap-[6px]">
        {orderLabel ? (
          <span className="text-[13px] text-[#7a746e]">Order #{orderLabel}</span>
        ) : null}
      </div>

      <div className="flex gap-[10px] flex-wrap">
        <button
          onClick={() => onApprove(review.id)}
          disabled={isUpdating}
          className="flex items-center gap-[6px] bg-[#2e7d5b] text-white h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:check" width={16} height={16} />
          Approve
        </button>
        <button
          onClick={() => onReject(review.id)}
          disabled={isUpdating}
          className="flex items-center gap-[6px] bg-white border border-[#e6e2dd] text-[#2c2a28] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon icon="mdi:close" width={16} height={16} />
          Reject
        </button>
        {review.orderId ? (
          <button
            onClick={() => onViewOrder(review.orderId as string)}
            className="flex items-center gap-[6px] bg-white border border-[#e6e2dd] text-[#2c2a28] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors"
          >
            <Icon icon="mdi:file-document-outline" width={16} height={16} />
            View Order
          </button>
        ) : null}
      </div>
    </div>
  );
}

function OrderDetailContent({ details }: { details: OrderDetails }) {
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
        <div className="flex items-center justify-between text-sm text-[#2c2a28]">
          <span>Vendor</span>
          <span>{details.vendorName}</span>
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

export default function ReviewModerationPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("pending");
  const [reviews, setReviews] = useState<ReviewModerationRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const result = await getReviewModerationReviews();
        if (!isMounted) return;
        if (!result.ok) {
          setReviews([]);
          setLoadError(result.error ?? "Failed to load reviews.");
          return;
        }
        setReviews(result.data ?? []);
      } catch (error) {
        if (!isMounted) return;
        setReviews([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load reviews.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const tabReviews = useMemo(
    () => reviews.filter((review) => review.status === activeTab),
    [reviews, activeTab]
  );

  const totalPages = Math.max(1, Math.ceil(tabReviews.length / PAGE_SIZE));
  const paginated = tabReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab: ReviewTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (id: string, status: ReviewModerationStatus) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const result = await updateReviewStatus(id, status);
      if (!result.ok) {
        alert(result.error ?? "Failed to update review.");
        return;
      }
      setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, status } : review)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update review.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleApprove = (id: string) => handleUpdateStatus(id, "approved");
  const handleReject = (id: string) => handleUpdateStatus(id, "rejected");

  const handleViewOrder = async (orderId: string) => {
    setOrderModalOpen(true);
    setOrderDetails(null);
    setOrderError(null);
    setOrderLoading(true);

    try {
      const result = await getReviewOrderDetails(orderId);
      if (!result.ok) {
        setOrderError(result.error ?? "Failed to load order details.");
        return;
      }
      setOrderDetails(result.data ?? null);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Failed to load order details.");
    } finally {
      setOrderLoading(false);
    }
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setOrderDetails(null);
    setOrderError(null);
    setOrderLoading(false);
  };

  const counts = {
    pending: reviews.filter((review) => review.status === "pending").length,
    approved: reviews.filter((review) => review.status === "approved").length,
    rejected: reviews.filter((review) => review.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-[32px]">
      <div>
        <h1 className="font-semibold text-[40px] text-[#2c2a28] leading-[48px]">
          Review Moderation
        </h1>
        <p className="text-[#7a746e] text-[14px] mt-[4px]">
          {counts.pending} pending | {counts.approved} approved | {counts.rejected} rejected
        </p>
      </div>

      <div className="flex gap-[8px] flex-wrap">
        <button
          onClick={() => handleTabChange("pending")}
          className={`flex items-center gap-[8px] h-[40px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeTab === "pending" ? "bg-[#e6e2dd] text-[#2c2a28]" : "bg-white text-[#7a746e] hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:view-grid-outline" width={16} height={16} />
          Pending
          {counts.pending > 0 ? (
            <span className={`rounded-full px-[7px] py-[1px] text-[12px] font-semibold
              ${activeTab === "pending" ? "bg-[#2c2a28] text-white" : "bg-[#e6e2dd] text-[#2c2a28]"}`}>
              {counts.pending}
            </span>
          ) : null}
        </button>
        <button
          onClick={() => handleTabChange("approved")}
          className={`flex items-center gap-[8px] h-[40px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeTab === "approved" ? "bg-[#2e7d5b] text-white border-[#2e7d5b]" : "bg-white text-[#7a746e] hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:check-circle-outline" width={16} height={16} />
          Approved
          {counts.approved > 0 ? (
            <span className={`rounded-full px-[7px] py-[1px] text-[12px] font-semibold
              ${activeTab === "approved" ? "bg-white text-[#2e7d5b]" : "bg-[#eaf4ee] text-[#2e7d5b]"}`}>
              {counts.approved}
            </span>
          ) : null}
        </button>
        <button
          onClick={() => handleTabChange("rejected")}
          className={`flex items-center gap-[8px] h-[40px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeTab === "rejected" ? "bg-[#cc3526] text-white border-[#cc3526]" : "bg-white text-[#7a746e] hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:close-circle-outline" width={16} height={16} />
          Rejected
          {counts.rejected > 0 ? (
            <span className={`rounded-full px-[7px] py-[1px] text-[12px] font-semibold
              ${activeTab === "rejected" ? "bg-white text-[#cc3526]" : "bg-[#fde4e1] text-[#c43c30]"}`}>
              {counts.rejected}
            </span>
          ) : null}
        </button>
      </div>

      <div className="flex items-center gap-[10px]">
        <Icon
          icon={
            activeTab === "approved"
              ? "mdi:check-circle"
              : activeTab === "rejected"
                ? "mdi:close-circle"
                : "mdi:clock-outline"
          }
          width={20} height={20}
          className={
            activeTab === "approved"
              ? "text-[#2e7d5b]"
              : activeTab === "rejected"
                ? "text-[#c43c30]"
                : "text-[#7a746e]"
          }
        />
        <span className="font-semibold text-[18px] text-[#2c2a28]">
          {activeTab === "approved"
            ? "Approved"
            : activeTab === "rejected"
              ? "Rejected"
              : "Pending"}
          {" "}Reviews ({tabReviews.length})
        </span>
      </div>

      <div className="bg-[#e6e2dd] h-px w-full -mt-[16px]" />

      {loadError ? (
        <div className="rounded-[12px] border border-[#fde4e1] bg-[#fff7f6] px-4 py-3 text-sm text-[#c43c30]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col gap-[24px]">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : tabReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] gap-[12px]">
          <Icon icon="mdi:check-circle-outline" width={64} height={64} className="text-[#b8b2ab]" />
          <p className="text-[#2c2a28] font-semibold text-[20px]">All clear!</p>
          <p className="text-[#7a746e] text-[14px]">
            No {activeTab} reviews at this time.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[24px] w-full">
          {paginated.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewOrder={handleViewOrder}
              isUpdating={updatingIds.has(review.id)}
            />
          ))}
        </div>
      )}

      {tabReviews.length > 0 ? (
        <div className="flex items-center justify-between w-full pt-[4px]">
          <p className="text-[#7a746e] text-[14px]">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, tabReviews.length)}-{Math.min(currentPage * PAGE_SIZE, tabReviews.length)} of {tabReviews.length} reviews
          </p>

          <div className="flex items-center gap-[4px]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="size-[36px] flex items-center justify-center rounded-[10px] border border-[#e6e2dd] bg-white text-[#7a746e] hover:bg-[#f3f2f0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:chevron-left" width={18} height={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`size-[36px] flex items-center justify-center rounded-[10px] text-[14px] font-medium transition-colors
                  ${currentPage === page
                    ? "bg-[#2c2a28] text-white border border-[#2c2a28]"
                    : "bg-white border border-[#e6e2dd] text-[#2c2a28] hover:bg-[#f3f2f0]"}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="size-[36px] flex items-center justify-center rounded-[10px] border border-[#e6e2dd] bg-white text-[#7a746e] hover:bg-[#f3f2f0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:chevron-right" width={18} height={18} />
            </button>
          </div>
        </div>
      ) : null}

      <Modal isOpen={orderModalOpen} onCloseAction={closeOrderModal}>
        {orderLoading ? (
          <div className="text-sm text-[#7a746e]">Loading order details...</div>
        ) : orderError ? (
          <div className="text-sm text-[#c43c30]">{orderError}</div>
        ) : orderDetails ? (
          <OrderDetailContent details={orderDetails} />
        ) : (
          <div className="text-sm text-[#7a746e]">No order details available.</div>
        )}
      </Modal>
    </div>
  );
}
