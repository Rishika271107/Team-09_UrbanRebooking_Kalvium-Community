import { prisma } from "@/lib/prisma";

/**
 * Returns recent rebooking events for a user as their activity feed.
 * Maps to RebookingEvent in the Prisma schema (the Activity model does not exist).
 */
export async function getUserActivities(userId: string) {
  return await prisma.rebookingEvent.findMany({
    where: {
      sourceBooking: { userId },
    },
    include: {
      sourceBooking: { include: { service: true } },
      newBooking: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
