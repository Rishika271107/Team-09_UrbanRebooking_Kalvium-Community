import React from "react";

export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export interface StatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getMeta = (st: string) => {
    switch (st.toUpperCase()) {
      case "COMPLETED":
        return {
          bg: "bg-emerald-50",
          color: "text-emerald-700",
          border: "border-emerald-200",
          label: "Completed",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-50",
          color: "text-red-700",
          border: "border-red-200",
          label: "Cancelled",
        };
      case "RESCHEDULED":
        return {
          bg: "bg-amber-50",
          color: "text-amber-700",
          border: "border-amber-200",
          label: "Rescheduled",
        };
      case "CONFIRMED":
      default:
        return {
          bg: "bg-blue-50",
          color: "text-blue-700",
          border: "border-blue-200",
          label: "Upcoming",
        };
    }
  };

  const meta = getMeta(status);

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border ${meta.bg} ${meta.color} ${meta.border} ${className}`}
    >
      {meta.label}
    </span>
  );
}
