import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getBookingById } from "@/services/booking.service";
import { getUserNotifications } from "@/services/notification.service";
import ConfirmationClient from "./ConfirmationClient";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  const [booking, notifications] = await Promise.all([
    getBookingById(bookingId),
    getUserNotifications(session.user.id),
  ]);

  if (!booking || booking.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const unreadNotificationsCount = notifications.filter((n: any) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <ConfirmationClient booking={booking} />
    </DashboardLayout>
  );
}
