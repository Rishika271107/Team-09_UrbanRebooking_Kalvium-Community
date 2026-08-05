import React from "react";
import { BellOff } from "lucide-react";

interface NotificationEmptyStateProps {
  title?: string;
  description?: string;
}

export function NotificationEmptyState({ 
  title = "No notifications", 
  description = "You're all caught up! Check back later for updates."
}: NotificationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
      <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <BellOff size={28} />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">{description}</p>
    </div>
  );
}
