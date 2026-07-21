"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { submitReviewAction } from "@/app/actions/review.actions";

export default function ReviewSection({ bookingId, professionalId }: { bookingId: string, professionalId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    const res = await submitReviewAction({
      bookingId,
      professionalId,
      rating,
      reviewText
    });
    
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Failed to submit review");
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Rate & Review</h3>
        <div className="p-4 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
          Thank you for your review!
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4 mt-6">
      <h3 className="text-lg font-bold text-slate-900">Rate & Review</h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">How was the service?</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={isLoading}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none disabled:opacity-50"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm font-medium text-slate-700">Comments (Optional)</label>
        <textarea
          disabled={isLoading}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience..."
          className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
          rows={3}
        />
      </div>

      <button
        disabled={isLoading || rating === 0}
        onClick={handleSubmit}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        Submit Review
      </button>
    </div>
  );
}
