import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserById } from "@/services/user.service";
import { getUserNotifications } from "@/services/notification.service";
import { getUserPaymentMethods } from "@/services/payment.service";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const user = await getUserById(userId);
  const notifications = await getUserNotifications(userId);
  const paymentMethods = await getUserPaymentMethods(userId);
  
  const unreadNotificationsCount = notifications.filter((n: any) => !n.readStatus).length;

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Management</h1>
          <p className="text-slate-500">Manage your account settings, addresses, and payment methods.</p>
        </div>
        <ProfileClient user={user} paymentMethods={paymentMethods} />
      </div>
    </DashboardLayout>
  );
}
