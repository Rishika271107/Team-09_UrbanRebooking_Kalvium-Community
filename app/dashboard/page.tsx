import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserNotifications } from "@/services/notification.service";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingServices } from "@/components/dashboard/UpcomingServices";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecommendedServices } from "@/components/dashboard/RecommendedServices";
import { getUserBookingsPaginated } from "@/services/booking.service";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [notifications, { bookings, total }] = await Promise.all([
    getUserNotifications(session.user.id),
    getUserBookingsPaginated(session.user.id, 0, 5),
  ]);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");

  // Find next upcoming appointment
  const nextBooking = confirmedBookings.find((b) => b.slotStart && new Date(b.slotStart) > new Date());
  const nextService = nextBooking
    ? {
        bookingId: nextBooking.id,
        serviceName: nextBooking.service.name,
        date: new Date(nextBooking.slotStart!).toLocaleDateString("en-IN"),
        time: new Date(nextBooking.slotStart!).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      }
    : null;

  // Stats cards
  const stats = [
    { id: "total", title: "Total Bookings", value: total, icon: "CalendarCheck" },
    { id: "completed", title: "Completed", value: completedCount, icon: "TrendingUp" },
    { id: "notifications", title: "Notifications", value: unreadCount, icon: "Repeat" },
  ];

  // Upcoming services (confirmed/pending, with a slot)
  const upcomingServices = confirmedBookings
    .filter((b) => b.slotStart)
    .slice(0, 3)
    .map((b) => ({
      id: b.id,
      serviceName: b.service.name,
      professionalName: b.professional?.user.name ?? "Unassigned",
      professionalAvatar: "",
      date: new Date(b.slotStart!).toLocaleDateString("en-IN"),
      time: new Date(b.slotStart!).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    }));

  // Recent activity
  const activities = bookings.map((b) => ({
    id: b.id,
    title: b.service.name,
    professionalName: b.professional?.user.name ?? null,
    date: b.slotStart
      ? new Date(b.slotStart).toLocaleDateString("en-IN")
      : new Date(b.createdAt).toLocaleDateString("en-IN"),
    status: b.status,
  }));

  // Recommended services
  const services = await prisma.service.findMany({ take: 4 });
  const recommendedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    price: s.price,
    rating: 4.5,
    image: "",
  }));

  const firstName = (session.user.name ?? "User").split(" ")[0];

  return (
    <DashboardLayout notificationCount={unreadCount}>
      <div className="flex flex-col gap-6 lg:gap-8 pb-10">
        <WelcomeBanner firstName={firstName} nextService={nextService} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatsCard key={stat.id} stat={stat} index={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <UpcomingServices services={upcomingServices} />
            <RecentActivity activities={activities} />
          </div>
          <div>
            <RecommendedServices services={recommendedServices} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}