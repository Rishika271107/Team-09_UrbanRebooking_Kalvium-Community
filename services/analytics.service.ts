import { prisma } from "@/lib/prisma";
import { ANALYTICS } from "@/lib/constants";

export async function getDashboardAnalytics(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { service: true },
  });

  const monthlyData: Record<string, { bookings: number; spending: number }> = {};
  const serviceUsage: Record<string, number> = {};
  const statusDistribution: Record<string, number> = {};

  for (const booking of bookings) {
    const month = booking.createdAt.toLocaleString("default", { month: "short" });
    monthlyData[month] ??= { bookings: 0, spending: 0 };
    monthlyData[month].bookings += 1;
    monthlyData[month].spending += booking.service.price;

    serviceUsage[booking.service.name] = (serviceUsage[booking.service.name] ?? 0) + 1;
    statusDistribution[booking.status] = (statusDistribution[booking.status] ?? 0) + 1;
  }

  const monthlyBookings = Object.entries(monthlyData).map(([name, v]) => ({ name, ...v }));

  const serviceUsageChart = Object.entries(serviceUsage)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, ANALYTICS.TOP_SERVICES_LIMIT);

  const statusColors: Record<string, string> = {
    DRAFT: ANALYTICS.CHART_COLORS.SLATE,
    PENDING: ANALYTICS.CHART_COLORS.AMBER,
    CONFIRMED: ANALYTICS.CHART_COLORS.BLUE,
    COMPLETED: ANALYTICS.CHART_COLORS.EMERALD,
    CANCELLED: ANALYTICS.CHART_COLORS.ROSE,
    DISPUTED: ANALYTICS.CHART_COLORS.VIOLET,
  };

  const bookingStatus = Object.entries(statusDistribution)
    .map(([name, value]) => ({ name, value, color: statusColors[name] ?? ANALYTICS.CHART_COLORS.SLATE }))
    .filter((s) => s.value > 0);

  const totalBookings = bookings.length;
  const rebookedCount = await prisma.booking.count({
    where: { userId, sourceBookingId: { not: null } },
  });
  const rebookPercentage = totalBookings > 0 ? Math.round((rebookedCount / totalBookings) * 100) : 0;

  return {
    monthlyBookings,
    serviceUsage: serviceUsageChart,
    bookingStatus,
    rebookRate: [
      { name: "Rebooked", value: rebookedCount, color: ANALYTICS.CHART_COLORS.TEAL },
      { name: "First-time", value: Math.max(totalBookings - rebookedCount, 0), color: ANALYTICS.CHART_COLORS.SLATE },
    ],
    summary: {
      totalBookings,
      totalSpent: bookings.reduce((sum, b) => sum + b.service.price, 0),
      rebookPercentage,
    },
  };
}
