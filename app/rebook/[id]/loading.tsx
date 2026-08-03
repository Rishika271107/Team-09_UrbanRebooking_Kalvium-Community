import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RebookPageSkeleton } from "@/components/dashboard/SkeletonLoaders";

export default function RebookLoading() {
  return (
    <DashboardLayout notificationCount={0}>
      <div className="flex flex-col gap-6 pb-10">
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-200" />
        </div>
        <RebookPageSkeleton />
      </div>
    </DashboardLayout>
  );
}
