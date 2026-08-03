import React from "react";
import { Star, StarHalf } from "lucide-react";

export interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = 14,
  showText = false,
  className = "",
}: RatingStarsProps) {
  const safeRating = Math.max(0, Math.min(rating, maxStars));
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-yellow-500 text-yellow-500" />
        ))}
        {hasHalfStar && (
          <StarHalf size={size} className="fill-yellow-500 text-yellow-500" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-slate-300" />
        ))}
      </div>
      {showText && (
        <span className="text-sm font-bold text-slate-700 ml-1">
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
