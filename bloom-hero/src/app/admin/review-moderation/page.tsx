"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { mockReviews, type ReviewRecord, type ReviewStatus } from "@/lib/mockData";

type ReviewTab = "pending" | "flagged";

// ── Star rating ────────────────────────────────────────────
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

// ── Skeleton card ──────────────────────────────────────────
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

// ── Review card ────────────────────────────────────────────
function ReviewCard({
  review,
  onApprove,
  onReject,
}: {
  review:    ReviewRecord;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-[16px] w-full border border-[#e6e2dd] shadow-[0px_6px_24px_0px_rgba(0,0,0,0.06)] flex flex-col gap-[14px] p-[20px]">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between w-full">
        <div className="flex gap-[12px] items-center">

          {/* Avatar placeholder */}
          <div className="size-[44px] rounded-full bg-[#e6e2dd] flex items-center justify-center shrink-0 overflow-hidden">
            <Icon icon="mdi:account-outline" width={24} height={24} className="text-[#7a746e]" />
          </div>

          <div>
            {/* Reviewer → Store + Stars */}
            <div className="flex items-center gap-[8px] flex-wrap">
              <span className="font-semibold text-[15px] text-[#2c2a28]">{review.reviewerName}</span>
              <span className="text-[#b8b2ab]">→</span>
              <span className="font-semibold text-[15px] text-[#2c2a28]">{review.storeName}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-[13px] text-[#7a746e] mt-[2px]">Posted: {review.postedAt}</p>
          </div>
        </div>

        {/* ··· menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="text-[#7a746e] hover:text-[#2c2a28] transition-colors p-[4px] rounded-[8px] hover:bg-[#f3f2f0]"
          >
            <Icon icon="mdi:dots-horizontal" width={20} height={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-[32px] bg-white border border-[#e6e2dd] rounded-[12px] shadow-[0px_8px_24px_rgba(0,0,0,0.08)] z-10 w-[160px] py-[6px]">
              <button className="w-full text-left px-[14px] py-[8px] text-[14px] text-[#2c2a28] hover:bg-[#f3f2f0] transition-colors">
                View full review
              </button>
              <button className="w-full text-left px-[14px] py-[8px] text-[14px] text-[#2c2a28] hover:bg-[#f3f2f0] transition-colors">
                View reviewer profile
              </button>
              <button className="w-full text-left px-[14px] py-[8px] text-[14px] text-[#c43c30] hover:bg-[#fde4e1] transition-colors">
                Escalate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="bg-[#e6e2dd] h-px w-full" />

      {/* ── Review body ────────────────────────────────── */}
      <p className="text-[14px] text-[#2c2a28] leading-[22px]">
        "{review.body}"
      </p>

      {/* Photo attached */}
      {review.photoAttached && (
        <div className="flex items-center gap-[8px]">
          <Icon icon="mdi:paperclip" width={15} height={15} className="text-[#c43c30]" />
          <span className="text-[13px] text-[#c43c30] font-medium">Photo attached</span>
          <div className="size-[48px] rounded-[8px] bg-[#e6e2dd] ml-[4px]" />
        </div>
      )}

      {/* ── Flag reason ────────────────────────────────── */}
      {review.flagReason && (
        <div className="flex items-center gap-[6px]">
          <Icon icon="mdi:flag" width={15} height={15} className="text-[#c43c30]" />
          <span className="text-[13px] text-[#c43c30] font-semibold">Flagged:</span>
          <span className="text-[13px] text-[#2c2a28]">{review.flagReason}</span>
        </div>
      )}

      {/* ── Order + verified purchase ───────────────────── */}
      <div className="flex items-center gap-[6px]">
        {review.orderNumber ? (
          <>
            <span className="text-[13px] text-[#7a746e]">Order #{review.orderNumber}</span>
            <span className="text-[#b8b2ab]">·</span>
          </>
        ) : null}
        {review.verifiedPurchase ? (
          <span className="flex items-center gap-[4px] text-[13px] text-[#7a746e]">
            <Icon icon="mdi:check" width={14} height={14} className="text-[#2e7d5b]" />
            Verified Purchase
          </span>
        ) : (
          <span className="flex items-center gap-[4px] text-[13px] text-[#7a746e]">
            <Icon icon="mdi:close" width={14} height={14} className="text-[#c43c30]" />
            No verified purchase found
          </span>
        )}
      </div>

      {/* ── Action buttons ──────────────────────────────── */}
      <div className="flex gap-[10px] flex-wrap">
        <button
          onClick={() => onApprove(review.id)}
          className="flex items-center gap-[6px] bg-[#2e7d5b] text-white h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#255f45] transition-colors"
        >
          <Icon icon="mdi:check" width={16} height={16} />
          Approve
        </button>
        <button
          onClick={() => onReject(review.id)}
          className="flex items-center gap-[6px] bg-white border border-[#e6e2dd] text-[#2c2a28] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors"
        >
          <Icon icon="mdi:close" width={16} height={16} />
          Reject
        </button>
        {review.orderNumber && (
          <button className="flex items-center gap-[6px] bg-white border border-[#e6e2dd] text-[#2c2a28] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
            <Icon icon="mdi:file-document-outline" width={16} height={16} />
            View Order
          </button>
        )}
        {review.showInvestigate && (
          <button className="flex items-center gap-[6px] bg-white border border-[#e6e2dd] text-[#2c2a28] h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#f3f2f0] transition-colors">
            <Icon icon="mdi:magnify" width={16} height={16} />
            Investigate
          </button>
        )}
        {review.showBlockUser && (
          <button className="flex items-center gap-[6px] bg-[#cc3526] text-white h-[44px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer hover:bg-[#b02d1e] transition-colors">
            <Icon icon="mdi:block-helper" width={16} height={16} />
            Block User
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
const PAGE_SIZE = 5;

export default function ReviewModerationPage() {
  const [activeTab, setActiveTab]     = useState<ReviewTab>("pending");
  const [reviews, setReviews]         = useState<ReviewRecord[]>(mockReviews);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = false;

  // ── Filter by tab ─────────────────────────────────────
  const tabReviews = useMemo(
    () => reviews.filter((r) => r.status === activeTab),
    [reviews, activeTab]
  );

  // ── Pagination ────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(tabReviews.length / PAGE_SIZE));
  const paginated   = tabReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab: ReviewTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ── Approve / reject ──────────────────────────────────
  const handleApprove = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
  };

  const handleReject = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    flagged: reviews.filter((r) => r.status === "flagged").length,
  };

  return (
    <div className="flex flex-col gap-[32px]">

      {/* ── Page header ─────────────────────────────────── */}
      <div>
        <h1 className="font-semibold text-[40px] text-[#2c2a28] leading-[48px]">
          Review Moderation
        </h1>
        <p className="text-[#7a746e] text-[14px] mt-[4px]">
          {counts.pending} pending · {counts.flagged} flagged
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="flex gap-[8px]">
        <button
          onClick={() => handleTabChange("pending")}
          className={`flex items-center gap-[8px] h-[40px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeTab === "pending" ? "bg-[#e6e2dd] text-[#2c2a28]" : "bg-white text-[#7a746e] hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:view-grid-outline" width={16} height={16} />
          Pending
          {counts.pending > 0 && (
            <span className={`rounded-full px-[7px] py-[1px] text-[12px] font-semibold
              ${activeTab === "pending" ? "bg-[#2c2a28] text-white" : "bg-[#e6e2dd] text-[#2c2a28]"}`}>
              {counts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange("flagged")}
          className={`flex items-center gap-[8px] h-[40px] px-[16px] rounded-[12px] text-[14px] font-medium cursor-pointer transition-colors border border-[#e6e2dd]
            ${activeTab === "flagged" ? "bg-[#cc3526] text-white border-[#cc3526]" : "bg-white text-[#7a746e] hover:bg-[#f0eeeb]"}`}
        >
          <Icon icon="mdi:flag-outline" width={16} height={16} />
          Flagged
          {counts.flagged > 0 && (
            <span className={`rounded-full px-[7px] py-[1px] text-[12px] font-semibold
              ${activeTab === "flagged" ? "bg-white text-[#cc3526]" : "bg-[#fde4e1] text-[#c43c30]"}`}>
              {counts.flagged}
            </span>
          )}
        </button>
      </div>

      {/* ── Section header ───────────────────────────────── */}
      <div className="flex items-center gap-[10px]">
        <Icon
          icon={activeTab === "flagged" ? "mdi:flag" : "mdi:clock-outline"}
          width={20} height={20}
          className={activeTab === "flagged" ? "text-[#c43c30]" : "text-[#7a746e]"}
        />
        <span className="font-semibold text-[18px] text-[#2c2a28]">
          {activeTab === "flagged" ? "Flagged" : "Pending"} Reviews ({tabReviews.length})
        </span>
      </div>

      <div className="bg-[#e6e2dd] h-px w-full -mt-[16px]" />

      {/* ── Cards / loading / empty ───────────────────────── */}
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
            />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────── */}
      {tabReviews.length > 0 && (
        <div className="flex items-center justify-between w-full pt-[4px]">
          <p className="text-[#7a746e] text-[14px]">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, tabReviews.length)}–{Math.min(currentPage * PAGE_SIZE, tabReviews.length)} of {tabReviews.length} reviews
          </p>

          <div className="flex items-center gap-[4px]">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="size-[36px] flex items-center justify-center rounded-[10px] border border-[#e6e2dd] bg-white text-[#7a746e] hover:bg-[#f3f2f0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:chevron-left" width={18} height={18} />
            </button>

            {/* Page numbers */}
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

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="size-[36px] flex items-center justify-center rounded-[10px] border border-[#e6e2dd] bg-white text-[#7a746e] hover:bg-[#f3f2f0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:chevron-right" width={18} height={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}