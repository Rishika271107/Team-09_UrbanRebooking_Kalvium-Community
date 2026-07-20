import { prisma } from "@/lib/prisma";

export async function getUserBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      service: true,
      professional: true,
      address: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUpcomingBooking(userId: string) {
  return await prisma.booking.findFirst({
    where: { 
      customerId: userId,
      status: 'UPCOMING'
    },
    include: {
      service: true,
      professional: true,
      address: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getQuickRebookBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { 
      customerId: userId,
      status: 'COMPLETED'
    },
    include: {
      service: true,
      professional: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });
}

export async function getUpcomingServicesList(userId: string) {
  return await prisma.booking.findMany({
    where: { 
      customerId: userId,
      status: 'UPCOMING'
    },
    include: {
      service: true,
      professional: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getBookingById(id: string) {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      professional: true,
      address: true,
      payment: true,
      customer: true,
    },
  });
}

export async function getUserBookingsPaginated(userId: string, skip: number = 0, take: number = 10) {
  return await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      service: true,
      professional: true,
      address: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}
