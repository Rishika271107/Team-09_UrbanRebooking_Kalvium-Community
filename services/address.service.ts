import { prisma } from "@/lib/prisma";

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

interface AddressInput {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export async function createAddress(userId: string, data: AddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = data.isDefault || count === 0;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.create({ data: { userId, ...data, isDefault } });
}

// Prisma's `update`/`delete` require a unique `where`, so ownership is
// verified with an updateMany/deleteMany (which accept compound filters)
// rather than update/delete with a made-up composite where.
export async function updateAddress(id: string, userId: string, data: AddressInput) {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const result = await prisma.address.updateMany({ where: { id, userId }, data });
  if (result.count === 0) {
    throw new Error("Address not found.");
  }
  return prisma.address.findUnique({ where: { id } });
}

export async function deleteAddress(id: string, userId: string) {
  const result = await prisma.address.deleteMany({ where: { id, userId } });
  if (result.count === 0) {
    throw new Error("Address not found.");
  }
  return { id };
}

export async function setDefaultAddress(id: string, userId: string) {
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  const result = await prisma.address.updateMany({ where: { id, userId }, data: { isDefault: true } });
  if (result.count === 0) {
    throw new Error("Address not found.");
  }
  return prisma.address.findUnique({ where: { id } });
}
