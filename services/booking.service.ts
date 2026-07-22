import { prisma } from "@/lib/prisma";

export async function getUserBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      service: true,
      professional: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUpcomingBooking(userId: string) {
  return await prisma.booking.findFirst({
    where: {
      userId,
      status: "CONFIRMED",
    },
    include: {
      service: true,
      professional: {
        include: { user: true },
      },
    },
    orderBy: { slotStart: "asc" },
  });
}

export async function getQuickRebookBookings(userId: string) {
  return await prisma.booking.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: {
      service: true,
      professional: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

export async function getUpcomingServicesList(userId: string) {
  return await prisma.booking.findMany({
    where: {
      userId,
      status: "CONFIRMED",
    },
    include: {
      service: true,
      professional: {
        include: { user: true },
      },
    },
    orderBy: { slotStart: "asc" },
  });
}

export async function getBookingById(id: string) {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      professional: {
        include: { user: true },
      },
    },
  });
}

export async function getUserBookingsPaginated(
  userId: string,
  skip: number = 0,
  take: number = 10
) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      service: true,
      professional: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}
