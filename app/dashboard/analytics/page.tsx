import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getDashboardAnalytics } from "@/services/analytics.service";
import { getUserNotifications } from "@/services/notification.service";
import AnalyticsCharts from "./AnalyticsCharts";

export const metadata = {
  title: "Analytics | Urban Company",
  description: "View your booking analytics and spending patterns.",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [analytics, notifications] = await Promise.all([
    getDashboardAnalytics(session.user.id),
    getUserNotifications(session.user.id),
  ]);

  const unreadNotificationsCount = notifications.filter(n => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500">Track your bookings, spending, and service usage over time.</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Total Bookings</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.summary.totalBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Total Spent</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">${analytics.summary.totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">Rebooking Rate</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.summary.rebookPercentage}%</p>
          </div>
        </div>

        <AnalyticsCharts data={analytics} />
      </div>
    </DashboardLayout>
  );
}
