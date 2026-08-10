"use client";

export function CardSkeleton() {
  return <div className="animate-pulse rounded-xl bg-slate-100 h-32" />;
}

export function TableRowSkeleton() {
  return (
    <div className="animate-pulse flex gap-4 rounded-xl border bg-white p-4">
      <div className="h-12 w-12 rounded-full bg-slate-200" />
      <div className="flex flex-1 flex-col gap-2 justify-center">
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="animate-pulse rounded-2xl bg-teal-100 h-40" />
      <div className="grid grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          <TableRowSkeleton />
          <TableRowSkeleton />
          <TableRowSkeleton />
        </div>
        <div className="flex flex-col gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white border border-slate-200 p-4 flex flex-col gap-3">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-8 w-16 rounded bg-slate-100" />
          <div className="h-3 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function QuickRebookSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 rounded-xl border bg-white p-4 items-center">
          <div className="h-12 w-12 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
          <div className="h-9 w-24 rounded-lg bg-slate-200 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-3 p-3 rounded-lg border bg-white items-start">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 px-5 py-4 items-start">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0 mt-0.5" />
          <div className="flex flex-1 flex-col gap-2 justify-center">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-1/4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}