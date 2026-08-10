import { prisma } from "@/lib/prisma";

export async function getAllServices() {
  return prisma.service.findMany({ orderBy: { name: "asc" } });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function getServicesByCategory(category: string) {
  return prisma.service.findMany({ where: { category }, orderBy: { name: "asc" } });
}

export async function getServiceCategories(): Promise<string[]> {
  const results = await prisma.service.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return results.map((r) => r.category);
}