import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileSkeleton } from "@/components/dashboard/SkeletonLoaders";

export default function ProfileLoading() {
  return (
    <DashboardLayout notificationCount={0}>
      <div className="flex flex-col gap-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 rounded bg-slate-200" />
        </div>
        <ProfileSkeleton />
      </div>
    </DashboardLayout>
  );
}
