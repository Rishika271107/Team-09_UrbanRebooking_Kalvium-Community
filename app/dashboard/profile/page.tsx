import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserById } from "@/services/user.service";
import { getUserNotifications } from "@/services/notification.service";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [user, notifications] = await Promise.all([
    getUserById(userId),
    getUserNotifications(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Management</h1>
          <p className="text-slate-500">Manage your account settings and saved addresses.</p>
        </div>
        <ProfileClient user={user} />
      </div>
    </DashboardLayout>
  );
}
