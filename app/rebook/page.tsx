import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";
import RebookListClient from "./RebookListClient";

export default async function RebookPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await getUserNotifications(session.user.id);
  const unreadNotificationsCount = notifications.filter((n: any) => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-6 lg:gap-8 pb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">One-Click Rebooking</h1>
          <p className="text-slate-500">
            Pick a previous service to rebook with a single click. We'll prefill everything.
          </p>
        </div>
        <RebookListClient />
      </div>
    </DashboardLayout>
  );
}
