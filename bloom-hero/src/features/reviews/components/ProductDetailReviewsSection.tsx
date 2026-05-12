// Source: `src/app/(customer)/_components/product-detail-layout.tsx` (customer product reviews section)


/*
  I LOVE YOU RANJIE <3
*/

"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { ProductReviewRow } from "../types";

type ReviewCardProps = {
  name: string;
  review: string;
  rating: number;
  date: string;
  approved?: boolean;
};

function Stars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <p className="text-[14px] leading-none">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < safeRating ? "text-[#f4b740]" : "text-[#d9d4cd]"}>
          ★
        </span>
      ))}
    </p>
  );
}

function ReviewCard({ name, review, rating, date, approved = false }: ReviewCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-[24px] border border-[#edeae6] bg-[#f6f1ee] p-[24px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex size-[56px] items-center justify-center rounded-full bg-[#edeae6] text-[16px] font-semibold text-[#5f5f5f]">
          {initials || "C"}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-bold text-[#1f1f1f]">{name}</p>
            {approved ? (
              <Icon
                icon="mdi:check-decagram"
                className="size-[16px] text-[#2e7d5b]"
                aria-label="Approved review"
              />
            ) : null}
          </div>
          <Stars rating={rating} />
        </div>
      </div>
      <p className="mt-4 text-[16px] leading-7 text-[#4f4b47]">
        {review || "No comment provided."}
      </p>
      <p className="mt-3 text-[14px] text-[#6b6b6b]">{date}</p>
    </div>
  );
}

function formatReviewDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ProductDetailReviewsSection({ reviews }: { reviews: ProductReviewRow[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedReviews = isExpanded ? reviews : reviews.slice(0, 3);
  const totalReviews = reviews.length;

  return (
    <section className="w-full max-w-[1200px] px-[64px] pb-[64px]">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[32px] font-bold text-[#1f1f1f]">Customer Reviews</h2>
        {totalReviews > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[16px] font-medium text-[#1f1f1f] hover:text-[#D24B46] underline cursor-pointer transition"
          >
            {isExpanded ? "Show less" : `View all ${totalReviews} reviews`}
          </button>
        )}
      </div>
      {totalReviews === 0 ? (
        <p className="mt-[24px] rounded-[24px] border border-[#edeae6] bg-[#f6f1ee] px-[24px] py-[28px] text-[16px] text-[#4f4b47]">
          No reviews yet for this product.
        </p>
      ) : (
        <div className="mt-[24px] grid gap-[20px] lg:grid-cols-3">
          {displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.customerName}
              review={review.comment ?? ""}
              rating={review.rating}
              date={formatReviewDate(review.reviewDate)}
              approved={review.status === "approved"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
