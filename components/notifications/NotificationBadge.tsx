import React from "react";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  return (
    <div className="relative inline-flex">
      <Bell size={24} className="text-slate-600 hover:text-slate-900 transition-colors" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}
