import React from "react";

export function ProfessionalSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column (Header, Skills, Reviews) */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 animate-pulse flex-shrink-0"></div>
          <div className="flex-1 w-full">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4 animate-pulse mx-auto md:mx-0"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse mx-auto md:mx-0"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6 animate-pulse mx-auto md:mx-0"></div>
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-20 bg-slate-200 rounded-full animate-pulse"></div>)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-16 bg-slate-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column (Calendar) */}
      <div className="w-full lg:w-[400px]">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="flex flex-col gap-6">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3 animate-pulse"></div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(j => <div key={j} className="h-9 bg-slate-200 rounded-lg animate-pulse"></div>)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="h-12 bg-slate-200 rounded-xl w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
