import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserNotifications } from "@/services/notification.service";
import NotificationsClient from "./NotificationsClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const notifications = await getUserNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="flex flex-col gap-6 lg:gap-8 pb-10">
        <h1 className="text-2xl font-bold text-slate-900">
          Notifications
        </h1>
        <NotificationsClient />
      </div>
    </DashboardLayout>
  );
}