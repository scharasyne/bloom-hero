"use client";

import { useState, useTransition } from "react";

import { type VendorReviewData } from "@/features/reviews/types";
import { updateVendorReviewByOwner } from "@/features/reviews/actions/update-vendor-review";

type Props = {
  initialReviews: VendorReviewData[];
};

export function VendorProfileEditor({ initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isReviewPending, startReviewTransition] = useTransition();
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState("");

  const openEditReview = (reviewId: string) => {
    const target = reviews.find((review) => review.id === reviewId);
    if (!target) return;
    setEditingReviewId(reviewId);
    setDraftRating(target.rating);
    setDraftComment(target.comment);
    setReviewMessage(null);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setDraftRating(5);
    setDraftComment("");
  };

  const saveReview = () => {
    if (!editingReviewId) return;
    setReviewMessage(null);

    startReviewTransition(async () => {
      const result = await updateVendorReviewByOwner({
        reviewId: editingReviewId,
        rating: draftRating,
        comment: draftComment,
      });

      if (!result.ok) {
        setReviewMessage(result.error ?? "Failed to update review.");
        return;
      }

      setReviews((prev) =>
        prev.map((review) =>
          review.id === editingReviewId
            ? {
                ...review,
                rating: draftRating,
                comment: draftComment.trim(),
              }
            : review
        )
      );
      setReviewMessage("Review updated.");
      cancelEditReview();
    });
  };

  return (
    <>
      <div className="mt-6 rounded-2xl border border-[#ece5dd] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#2c2825]">Edit reviews</h3>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-[#8b847c]">No reviews to edit yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review) => {
              const isEditing = editingReviewId === review.id;
              return (
                <div key={review.id} className="rounded-xl border border-[#eee8e1] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#2a2724]">{review.customerName}</p>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => openEditReview(review.id)}
                        className="text-xs text-[#2f5d3a] hover:underline"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                  {!isEditing ? (
                    <p className="text-sm text-[#4c4742]">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)} - {review.comment || "No comment."}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={draftRating}
                        onChange={(event) => setDraftRating(Number(event.target.value))}
                        className="w-full rounded-lg border border-[#d9d2ca] px-2 py-2 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value} star{value > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={draftComment}
                        onChange={(event) => setDraftComment(event.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-[#d9d2ca] px-2 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveReview}
                          disabled={isReviewPending}
                          className="rounded-full bg-[#2f5d3a] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {isReviewPending ? "Saving..." : "Save review"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditReview}
                          className="rounded-full border border-[#d9d2ca] px-3 py-1 text-xs text-[#4a453f]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {reviewMessage ? <p className="mt-3 text-xs text-[#6f6a65]">{reviewMessage}</p> : null}
      </div>
    </>
  );
}
