"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitCustomerReview } from "../review/actions";

type ReviewFormProps = {
  orderId: string;
  vendorId: string | null;
  productId: string | null;
  existingReview?: { id: string; rating: number; comment: string | null } | null;
};

export function ReviewForm({ orderId, vendorId, productId, existingReview }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      alert("Missing vendor for this order.");
      return;
    }
    if (!productId) {
      alert("Missing product for this order.");
      return;
    }
    try {
      setSubmitting(true);
      const result = await submitCustomerReview({
        orderId,
        vendorId,
        productId,
        rating,
        comment,
        reviewId: existingReview?.id,
      });

      if (!result.ok) {
        alert(result.error ?? "Failed to submit review. Please try again.");
        return;
      }

      alert("Thank you for your review!");
      router.push("/orders");
      router.refresh();
    } catch (err) {
      console.error("submit review failed:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-[#2f2f2f] mb-2">
          Rating
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-32 rounded-full border border-[#e2ddd4] bg-[#faf7f2] px-3 py-2 text-sm text-[#2f2f2f] outline-none focus:ring-2 focus:ring-[#2f5d3a]/40"
        >
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {v} star{v !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2f2f2f] mb-2">
          Your Feedback
        </label>
        <textarea
          className="w-full rounded-2xl border border-[#e2ddd4] bg-[#faf7f2] px-4 py-3 text-sm text-[#2f2f2f] min-h-35 outline-none focus:ring-2 focus:ring-[#2f5d3a]/40"
          placeholder="Share your experience with this order..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="flex justify-center mt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#2f5d3a] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#26492f] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Saving..."
            : existingReview
            ? "Update Review"
            : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

