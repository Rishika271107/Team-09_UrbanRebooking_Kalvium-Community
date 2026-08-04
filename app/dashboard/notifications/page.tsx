import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const notifications = await getUserNotifications(userId);
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.readStatus
  ).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Notifications
        </h1>

        <NotificationsClient initialNotifications={notifications} />
      </div>
    </DashboardLayout>
  );
}