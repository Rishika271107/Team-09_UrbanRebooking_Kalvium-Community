import React from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

const colors = [
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];

export function Avatar({ src, alt = "Avatar", name, size = "md", className = "" }: AvatarProps) {
  const getInitials = (n: string) => {
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const getColor = (n: string) => {
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const szClass = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || alt}
        className={`rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 ${szClass} ${className}`}
      />
    );
  }

  const initials = name ? getInitials(name) : "U";
  const colorClass = name ? getColor(name) : colors[0];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm flex-shrink-0 ${colorClass} ${szClass} ${className}`}
      aria-label={name || alt}
      title={name || alt}
    >
      {initials}
    </div>
  );
}
