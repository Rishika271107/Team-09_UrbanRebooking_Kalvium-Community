import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function Loading() {
  return (
    <DashboardLayout notificationCount={0}>
      <div className="flex flex-col items-center justify-center gap-8 py-8 md:py-12 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-slate-200"></div>
          <div className="h-8 w-48 rounded bg-slate-200 mt-2"></div>
          <div className="h-4 w-64 rounded bg-slate-200 mt-1"></div>
        </div>

        {/* Card Skeleton */}
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100">
             <div className="flex justify-between mb-6">
                <div className="flex gap-4">
                   <div className="h-14 w-14 rounded-full bg-slate-200"></div>
                   <div className="flex flex-col gap-2 justify-center">
                     <div className="h-5 w-32 rounded bg-slate-200"></div>
                     <div className="h-3 w-24 rounded bg-slate-200"></div>
                   </div>
                </div>
                <div className="h-6 w-20 rounded bg-slate-200"></div>
             </div>
             <div className="h-24 w-full rounded-xl bg-slate-100"></div>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="h-4 w-32 rounded bg-slate-200 mb-6"></div>
            <div className="flex flex-col gap-4">
              <div className="h-4 w-full rounded bg-slate-100"></div>
              <div className="h-4 w-full rounded bg-slate-100"></div>
              <div className="h-6 w-full rounded bg-slate-200 mt-2"></div>
            </div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex flex-col gap-6 w-full max-w-2xl">
           <div className="flex gap-3">
             <div className="h-12 flex-1 rounded-xl bg-slate-200"></div>
             <div className="h-12 flex-1 rounded-xl bg-slate-200"></div>
           </div>
           <div className="flex justify-center gap-4 border-t border-slate-200 pt-6">
             <div className="h-8 w-32 rounded-lg bg-slate-200"></div>
             <div className="h-8 w-32 rounded-lg bg-slate-200"></div>
             <div className="h-8 w-40 rounded-lg bg-slate-200"></div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
