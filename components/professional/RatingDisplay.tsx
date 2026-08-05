import React from "react";
import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
}

export function RatingDisplay({ rating }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
}
