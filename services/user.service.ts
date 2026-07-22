import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getDashboardStatistics(userId: string) {
  const totalBookings = await prisma.booking.count({
    where: { userId },
  });

  const upcomingBookings = await prisma.booking.count({
    where: { userId, status: "CONFIRMED" },
  });

  const rebookedServices = await prisma.rebookingEvent.count({
    where: {
      sourceBooking: { userId },
      outcome: "SUCCESS",
    },
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
      title: "Saved Address",
      value: 1,
      description: "Your location",
      icon: "MapPin",
    },
  ];
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string; phone?: string; address?: string }
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserPassword(userId: string, hashedPassword: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}
