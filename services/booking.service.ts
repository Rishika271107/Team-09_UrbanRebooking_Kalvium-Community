import { prisma } from "@/lib/prisma";

const bookingInclude = {
  service: true,
  professional: { include: { user: { select: { name: true } } } },
} as const;

export async function getUserBookingsPaginated(userId: string, skip = 0, take = 10) {
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: [{ slotStart: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.booking.count({ where: { userId } }),
  ]);

  return { bookings, total };
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
}
