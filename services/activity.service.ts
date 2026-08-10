import { prisma } from "@/lib/prisma";

export async function getUserActivity(userId: string, limit = 10) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      service: true,
      professional: { include: { user: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return bookings.map((b) => ({
    id: b.id,
    title: b.service.name,
    professionalName: b.professional?.user.name ?? null,
    date: b.slotStart
      ? new Date(b.slotStart).toLocaleDateString("en-IN")
      : new Date(b.createdAt).toLocaleDateString("en-IN"),
    status: b.status,
  }));
}