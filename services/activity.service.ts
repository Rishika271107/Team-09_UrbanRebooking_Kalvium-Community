import { prisma } from "@/lib/prisma";

export async function getUserActivities(userId: string) {
  return await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}
