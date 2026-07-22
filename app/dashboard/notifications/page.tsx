import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const notifications = await getUserNotifications(userId);
  const unreadNotificationsCount = notifications.filter((n: any) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated with your bookings and account activity.</p>
        </div>
        <NotificationsClient initialNotifications={notifications} />
      </div>
    </DashboardLayout>
  );
}
