import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics(userId: string) {
  // 1. Monthly Bookings (Line Chart)
  // 2. Service Usage (Bar Chart)
  // 3. Rebooking Rate (Pie Chart)
  // 4. Monthly Spending (Area Chart)
  // 5. Booking Status (Donut Chart)

  const allBookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: { service: true, payment: true },
  });

  // Monthly Bookings & Spending
  const monthlyData: Record<string, { bookings: number; spending: number }> = {};
  
  // Service Usage
  const serviceUsage: Record<string, number> = {};

  // Status Distribution
  const statusDistribution: Record<string, number> = { UPCOMING: 0, COMPLETED: 0, CANCELLED: 0 };

  allBookings.forEach((b) => {
    // Process month (simple grouping)
    // Date string might be "2026-07-21" or "21 Jul 2026", assuming we can parse it
    const date = new Date(b.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });
    
    if (!monthlyData[month]) {
      monthlyData[month] = { bookings: 0, spending: 0 };
    }
    monthlyData[month].bookings += 1;
    monthlyData[month].spending += b.price;

    // Process service usage
    const serviceName = b.service.name;
    serviceUsage[serviceName] = (serviceUsage[serviceName] || 0) + 1;

    // Process status
    if (statusDistribution[b.status] !== undefined) {
      statusDistribution[b.status] += 1;
    }
  });

  const formattedMonthly = Object.keys(monthlyData).map(month => ({
    name: month,
    bookings: monthlyData[month].bookings,
    spending: monthlyData[month].spending
  }));

  const formattedServices = Object.keys(serviceUsage).map(name => ({
    name,
    value: serviceUsage[name]
  })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5

  const formattedStatus = [
    { name: 'Upcoming', value: statusDistribution.UPCOMING, color: '#3b82f6' },
    { name: 'Completed', value: statusDistribution.COMPLETED, color: '#10b981' },
    { name: 'Cancelled', value: statusDistribution.CANCELLED, color: '#f43f5e' },
  ].filter(s => s.value > 0);

  // Rebooking Rate
  const totalBookings = allBookings.length;
  const rebooks = await prisma.rebookHistory.count({
    where: { originalBooking: { customerId: userId } }
  });

  const rebookRate = totalBookings > 0 ? Math.round((rebooks / totalBookings) * 100) : 0;
  
  const formattedRebookRate = [
    { name: 'Rebooked', value: rebooks, color: '#0f766e' },
    { name: 'Single Booking', value: totalBookings > rebooks ? totalBookings - rebooks : 0, color: '#94a3b8' }
  ];

  return {
    monthlyBookings: formattedMonthly,
    serviceUsage: formattedServices,
    bookingStatus: formattedStatus,
    rebookRate: formattedRebookRate,
    summary: {
      totalBookings,
      totalSpent: allBookings.reduce((sum, b) => sum + b.price, 0),
      rebookPercentage: rebookRate
    }
  };
}
