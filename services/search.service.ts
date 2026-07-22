import { prisma } from "@/lib/prisma";

export async function globalSearch(query: string, userId?: string) {
  if (!query || query.trim() === "") {
    return { services: [], professionals: [], bookings: [] };
  }

  const searchTerm = query.toLowerCase();

  const services = await prisma.service.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { category: { contains: searchTerm } },
      ],
    },
    take: 5,
  });

  const professionals = await prisma.professional.findMany({
    where: {
      OR: [
        { user: { name: { contains: searchTerm } } },
        { skills: { contains: searchTerm } },
      ],
    },
    include: {
      user: true,
    },
    take: 5,
  });

  let bookings: any[] = [];
  if (userId) {
    bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
        OR: [
          { service: { name: { contains: searchTerm } } },
          { professional: { user: { name: { contains: searchTerm } } } },
        ],
      },
      include: {
        service: true,
        professional: {
          include: {
            user: true,
          }
        },
      },
      take: 5,
    });
  }

  return {
    services,
    professionals,
    bookings,
  };
}
