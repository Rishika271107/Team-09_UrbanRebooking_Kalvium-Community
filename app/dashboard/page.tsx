import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickRebookCard, QuickRebookProps } from "@/components/dashboard/QuickRebookCard";
import { ServiceCategoryCard } from "@/components/dashboard/ServiceCategoryCard";
import { UpcomingServices } from "@/components/dashboard/UpcomingServices";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

import { getDashboardStatistics } from "@/services/user.service";
import { getQuickRebookBookings, getUpcomingBooking, getUpcomingServicesList } from "@/services/booking.service";
import { getAllServices } from "@/services/service.service";
import { getUserActivities } from "@/services/activity.service";
import { getUserNotifications } from "@/services/notification.service";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all data in parallel
  const [
    statistics,
    quickRebookBookings,
    upcomingBooking,
    upcomingServicesList,
    allServices,
    activities,
    notifications
  ] = await Promise.all([
    getDashboardStatistics(userId),
    getQuickRebookBookings(userId),
    getUpcomingBooking(userId),
    getUpcomingServicesList(userId),
    getAllServices(),
    getUserActivities(userId),
    getUserNotifications(userId),
  ]);

  const firstName = session.user.name?.split(" ")[0] || "";
  
  const formattedNextService = upcomingBooking ? {
    bookingId: upcomingBooking.id,
    serviceName: upcomingBooking.service.name,
    date: upcomingBooking.date,
    time: upcomingBooking.time,
  } : null;

  const formattedQuickRebook: QuickRebookProps[] = quickRebookBookings.map(b => ({
    id: b.id,
    serviceName: b.service.name,
    professionalName: b.professional.name,
    professionalAvatar: b.professional.avatar,
    rating: b.professional.rating,
    jobsCompleted: b.professional.jobsCompleted,
    lastBooked: b.date,
    price: b.price,
  }));

  const formattedUpcomingServices = upcomingServicesList.map(b => ({
    id: b.id,
    serviceName: b.service.name,
    professionalName: b.professional.name,
    professionalAvatar: b.professional.avatar,
    date: b.date,
    time: b.time,
  }));

  const formattedActivities = activities.map(a => ({
    id: a.id,
    title: a.title,
    professionalName: a.professionalName,
    date: a.date,
  }));

  const unreadNotificationsCount = notifications.filter(n => !n.readStatus).length;

  return (
    <DashboardLayout notificationCount={unreadNotificationsCount}>
      <div className="flex flex-col gap-8 pb-10">
        <WelcomeBanner firstName={firstName} nextService={formattedNextService} />

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((stat, i) => (
              <StatsCard key={stat.id} stat={stat as any} index={i} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Quick Rebook</h2>
            <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View All</button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {formattedQuickRebook.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No completed bookings available to rebook.</div>
            ) : (
              formattedQuickRebook.map((item) => (
                <QuickRebookCard key={item.id} item={item} />
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Service Categories</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {allServices.map((category) => (
              <ServiceCategoryCard key={category.id} category={{
                id: category.id,
                name: category.name,
                startingPrice: category.startingPrice,
                icon: category.icon,
                color: category.color || 'bg-slate-100 text-slate-600'
              }} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <UpcomingServices services={formattedUpcomingServices} />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity activities={formattedActivities} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
