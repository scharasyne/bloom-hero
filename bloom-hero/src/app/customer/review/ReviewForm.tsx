"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type ReviewFormProps = {
  orderId: string;
  vendorId: string | null;
  customerId: string;
  existingReview?: { id: string; rating: number; comment: string | null } | null;
};

export function ReviewForm({ orderId, vendorId, customerId, existingReview }: ReviewFormProps) {
  const supabase = createSupabaseBrowserClient();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      alert("Missing vendor for this order.");
      return;
    }
    try {
      setSubmitting(true);
      let error = null;

      if (existingReview?.id) {
        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq("id", existingReview.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("reviews").insert({
          customer_id: customerId,
          vendor_id: vendorId,
          rating,
          comment: comment.trim() || null,
        });
        error = insertError;
      }

      if (error) {
        console.error("submit review error:", error);
        alert("Failed to submit review. Please try again.");
        return;
      }

      alert("Thank you for your review!");
      window.location.href = "/orders?tab=completed";
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
          className="w-full rounded-2xl border border-[#e2ddd4] bg-[#faf7f2] px-4 py-3 text-sm text-[#2f2f2f] min-h-[140px] outline-none focus:ring-2 focus:ring-[#2f5d3a]/40"
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

