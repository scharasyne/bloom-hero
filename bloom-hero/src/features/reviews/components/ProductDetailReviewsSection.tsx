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
    <div className="rounded-2xl border border-[#edeae6] bg-[#f6f1ee] p-4 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.06)] sm:rounded-[24px] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#edeae6] text-sm font-semibold text-[#5f5f5f] sm:size-14 sm:text-base">
          {initials || "C"}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1f1f1f] sm:text-base">{name}</p>
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
      <p className="mt-3 text-sm leading-7 text-[#4f4b47] sm:mt-4 sm:text-base">
        {review || "No comment provided."}
      </p>
      <p className="mt-2 text-xs text-[#6b6b6b] sm:mt-3 sm:text-sm">{date}</p>
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
    <section className="page-x mx-auto w-full max-w-[1200px] pb-10 sm:pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className="text-2xl font-bold text-[#1f1f1f] sm:text-3xl">Customer Reviews</h2>
        {totalReviews > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-fit cursor-pointer text-left text-sm font-medium text-[#1f1f1f] underline transition hover:text-[#D24B46] sm:text-base"
          >
            {isExpanded ? "Show less" : `View all ${totalReviews} reviews`}
          </button>
        )}
      </div>
      {totalReviews === 0 ? (
        <p className="mt-5 rounded-2xl border border-[#edeae6] bg-[#f6f1ee] px-4 py-6 text-sm text-[#4f4b47] sm:mt-6 sm:rounded-[24px] sm:px-6 sm:py-7 sm:text-base">
          No reviews yet for this product.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
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
