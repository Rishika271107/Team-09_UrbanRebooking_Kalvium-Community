import { prisma } from "@/lib/prisma";

export async function getUserAddresses(userId: string) {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
}
