import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BookingDetailsSkeleton } from "@/components/dashboard/SkeletonLoaders";

export default function BookingDetailsLoading() {
  return (
    <DashboardLayout notificationCount={0}>
      <BookingDetailsSkeleton />
    </DashboardLayout>
  );
}
