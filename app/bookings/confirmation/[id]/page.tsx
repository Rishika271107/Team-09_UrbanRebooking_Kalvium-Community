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

  const { id: bookingId } = await params;

  const booking = await getBookingById(bookingId);

  if (!booking || booking.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const notifications = await getUserNotifications(session.user.id);
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.readStatus
  ).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <ConfirmationClient booking={booking} />
    </DashboardLayout>
  );
}