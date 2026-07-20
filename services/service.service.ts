import { prisma } from "@/lib/prisma";

export async function getAllServices() {
  return await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getServiceById(id: string) {
  return await prisma.service.findUnique({
    where: { id },
  });
}
