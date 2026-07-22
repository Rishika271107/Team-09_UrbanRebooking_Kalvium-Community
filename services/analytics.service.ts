import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics(_userId: string) {
  // Use the actual schema — no customerId, payment, price, or rebookHistory fields.
  const allBookings = await prisma.booking.findMany({
    where: { userId: _userId },
    include: { service: true },
  });

  // Monthly Bookings
  const monthlyData: Record<string, { bookings: number; spending: number }> = {};
  const serviceUsage: Record<string, number> = {};
  const statusDistribution: Record<string, number> = {
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    PENDING: 0,
    DRAFT: 0,
    DISPUTED: 0,
  };

  allBookings.forEach((b) => {
    const date = new Date(b.createdAt);
    const month = date.toLocaleString("default", { month: "short" });

    if (!monthlyData[month]) {
      monthlyData[month] = { bookings: 0, spending: 0 };
    }
    monthlyData[month].bookings += 1;
    monthlyData[month].spending += b.service.price;

    const serviceName = b.service.name;
    serviceUsage[serviceName] = (serviceUsage[serviceName] || 0) + 1;

    if (statusDistribution[b.status] !== undefined) {
      statusDistribution[b.status] += 1;
    }
  });

  const formattedMonthly = Object.keys(monthlyData).map((month) => ({
    name: month,
    bookings: monthlyData[month].bookings,
    spending: monthlyData[month].spending,
  }));

  const formattedServices = Object.keys(serviceUsage)
    .map((name) => ({ name, value: serviceUsage[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const formattedStatus = [
    { name: "Confirmed", value: statusDistribution.CONFIRMED, color: "#3b82f6" },
    { name: "Completed", value: statusDistribution.COMPLETED, color: "#10b981" },
    { name: "Cancelled", value: statusDistribution.CANCELLED, color: "#f43f5e" },
    { name: "Pending", value: statusDistribution.PENDING, color: "#f59e0b" },
  ].filter((s) => s.value > 0);

  // Rebooking rate via RebookingEvent (replaces rebookHistory)
  const totalBookings = allBookings.length;
  const rebooks = await prisma.rebookingEvent.count({
    where: {
      sourceBooking: { userId: _userId },
      outcome: "SUCCESS",
    },
  });

  const rebookRate = totalBookings > 0 ? Math.round((rebooks / totalBookings) * 100) : 0;

  const formattedRebookRate = [
    { name: "Rebooked", value: rebooks, color: "#0f766e" },
    {
      name: "Single Booking",
      value: totalBookings > rebooks ? totalBookings - rebooks : 0,
      color: "#94a3b8",
    },
  ];

  return {
    monthlyBookings: formattedMonthly,
    serviceUsage: formattedServices,
    bookingStatus: formattedStatus,
    rebookRate: formattedRebookRate,
    summary: {
      totalBookings,
      totalSpent: allBookings.reduce((sum, b) => sum + b.service.price, 0),
      rebookPercentage: rebookRate,
    },
  };
}
