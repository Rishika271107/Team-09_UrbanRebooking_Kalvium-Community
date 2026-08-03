import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BookingHistorySkeleton } from "@/components/dashboard/SkeletonLoaders";

export default function BookingHistoryLoading() {
  return (
    <DashboardLayout notificationCount={0}>
      <div className="flex flex-col gap-6 pb-10">
        <div className="animate-pulse">
          <div className="h-8 w-40 rounded bg-slate-200 mb-1" />
          <div className="h-4 w-64 rounded bg-slate-200" />
        </div>
        <BookingHistorySkeleton />
      </div>
    </DashboardLayout>
  );
}
