import React from "react";
import { MessageSquare } from "lucide-react";
import { RatingDisplay } from "./RatingDisplay";

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  text: string;
}

interface ReviewListProps {
  reviews: ReviewItem[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-teal-600" />
        Customer Reviews
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          No reviews yet. Be the first to leave one!
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {reviews.map((review, idx) => (
            <div 
              key={review.id} 
              className={`flex flex-col gap-2 ${idx !== reviews.length - 1 ? "border-b border-slate-100 pb-5" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{review.customerName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{review.date}</p>
                </div>
                <RatingDisplay rating={review.rating} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
