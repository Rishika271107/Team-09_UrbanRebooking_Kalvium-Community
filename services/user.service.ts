import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { addresses: true },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getDashboardStatistics(userId: string) {
  const [totalBookings, upcomingBookings, rebookedServices, savedAddresses] = await Promise.all([
    prisma.booking.count({ where: { userId } }),
    prisma.booking.count({ where: { userId, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { userId, sourceBookingId: { not: null } } }),
    prisma.address.count({ where: { userId } }),
  ]);

  return [
    { id: "s1", title: "Total Bookings", value: totalBookings, description: "Lifetime bookings", icon: "CalendarCheck" },
    { id: "s2", title: "Upcoming Services", value: upcomingBookings, description: "Scheduled bookings", icon: "Clock" },
    { id: "s3", title: "Rebooked Services", value: rebookedServices, description: "Favorites rebooked", icon: "Settings" },
    { id: "s4", title: "Saved Addresses", value: savedAddresses, description: "Your locations", icon: "MapPin" },
  ];
}

export async function updateUserProfile(
  userId: string,
  data: { fullName?: string; email?: string; phone?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
    },
  });
}

export async function updateUserPassword(userId: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}
