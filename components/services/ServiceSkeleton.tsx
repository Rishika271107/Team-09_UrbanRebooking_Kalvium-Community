import React from "react";

export function ServiceSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="h-6 w-24 bg-slate-200 rounded-md animate-pulse"></div>
            <div className="h-5 w-12 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-6 w-3/4 bg-slate-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded mb-4 mt-auto animate-pulse"></div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
