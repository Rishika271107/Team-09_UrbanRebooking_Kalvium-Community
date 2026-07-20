import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: { addresses: true },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getDashboardStatistics(userId: string) {
  const totalBookings = await prisma.booking.count({
    where: { customerId: userId },
  });
  
  const upcomingBookings = await prisma.booking.count({
    where: { customerId: userId, status: 'UPCOMING' },
  });
  
  const rebookedServices = await prisma.rebookHistory.count({
    where: { originalBooking: { customerId: userId } },
  });
  
  const savedAddresses = await prisma.address.count({
    where: { userId },
  });

  return [
    {
      id: "s1",
      title: "Total Bookings",
      value: totalBookings,
      description: "Lifetime bookings",
      icon: "CalendarCheck",
    },
    {
      id: "s2",
      title: "Upcoming Services",
      value: upcomingBookings,
      description: "Scheduled bookings",
      icon: "Clock",
    },
    {
      id: "s3",
      title: "Rebooked Services",
      value: rebookedServices,
      description: "Favorites rebooked",
      icon: "Settings",
    },
    {
      id: "s4",
      title: "Saved Addresses",
      value: savedAddresses,
      description: "Your locations",
      icon: "MapPin",
    },
  ];
}
