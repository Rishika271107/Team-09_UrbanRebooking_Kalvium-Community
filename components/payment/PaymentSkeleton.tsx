import React from "react";

export function PaymentSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 animate-pulse">
          <div className="w-10 h-6 bg-slate-200 rounded"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
          <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}
