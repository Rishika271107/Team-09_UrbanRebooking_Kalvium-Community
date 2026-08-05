import React from "react";

export function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-2">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-200 animate-pulse"></div>
          <div className="flex flex-1 justify-between">
            <div className="flex flex-col gap-2 mt-1 w-2/3">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse w-full"></div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
