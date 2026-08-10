import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";

export default async function ProfessionalCalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await getUserNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="flex flex-col gap-6 pb-10">
        <h1 className="text-2xl font-bold text-slate-900">My Calendar</h1>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-slate-500 text-sm">Calendar view coming soon.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}