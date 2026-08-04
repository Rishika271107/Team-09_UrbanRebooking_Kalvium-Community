import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/SkeletonLoaders";

export default function DashboardLoading() {
  return (
    <DashboardLayout notificationCount={0}>
      <DashboardSkeleton />
    </DashboardLayout>
  );
}
