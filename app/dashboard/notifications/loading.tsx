import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { NotificationSkeleton } from "@/components/dashboard/SkeletonLoaders";

export default function NotificationsLoading() {
  return (
    <DashboardLayout notificationCount={0}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-10">
        <div className="animate-pulse h-8 w-40 rounded bg-slate-200" />
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 animate-pulse">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
          </div>
          <NotificationSkeleton count={8} />
        </div>
      </div>
    </DashboardLayout>
  );
}
