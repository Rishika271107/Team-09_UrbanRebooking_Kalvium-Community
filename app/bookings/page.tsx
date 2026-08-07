import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";
import BookingHistoryClient from "./BookingHistoryClient";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await getUserNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="flex flex-col gap-6 lg:gap-8 pb-10">
        <h1 className="text-2xl font-bold text-slate-900">Booking History</h1>
        <BookingHistoryClient />
      </div>
    </DashboardLayout>
  );
}