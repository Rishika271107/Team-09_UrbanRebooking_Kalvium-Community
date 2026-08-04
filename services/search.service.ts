import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";

export async function globalSearch(query: string, userId?: string) {
  const term = query?.trim();
  if (!term) {
    return { services: [], professionals: [], bookings: [] };
  }

  const [services, professionals, bookings] = await Promise.all([
    prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { category: { contains: term, mode: "insensitive" } },
        ],
      },
      take: PAGINATION.SEARCH_RESULT_LIMIT,
    }),
    prisma.professional.findMany({
      where: {
        OR: [
          { user: { name: { contains: term, mode: "insensitive" } } },
          { skills: { has: term } },
        ],
      },
      include: { user: { select: { name: true } } },
      take: PAGINATION.SEARCH_RESULT_LIMIT,
    }),
    userId
      ? prisma.booking.findMany({
          where: {
            userId,
            service: { name: { contains: term, mode: "insensitive" } },
          },
          include: { service: true, professional: { include: { user: { select: { name: true } } } } },
          take: PAGINATION.SEARCH_RESULT_LIMIT,
        })
      : Promise.resolve([]),
  ]);

  return { services, professionals, bookings };
}
