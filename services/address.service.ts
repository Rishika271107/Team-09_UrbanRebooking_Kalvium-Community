import { prisma } from "@/lib/prisma";

export async function getUserAddresses(userId: string) {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
}

export async function createAddress(userId: string, data: { addressLine: string; city: string; state: string; pincode: string; isDefault?: boolean }) {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const count = await prisma.address.count({ where: { userId } });
  const isDefault = data.isDefault || count === 0;

  return await prisma.address.create({
    data: {
      userId,
      ...data,
      isDefault,
    },
  });
}

export async function updateAddress(id: string, userId: string, data: { addressLine: string; city: string; state: string; pincode: string; isDefault?: boolean }) {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return await prisma.address.update({
    where: { id, userId }, // Ensure user owns the address
    data,
  });
}

export async function deleteAddress(id: string, userId: string) {
  return await prisma.address.delete({
    where: { id, userId },
  });
}

export async function setDefaultAddress(id: string, userId: string) {
  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return await prisma.address.update({
    where: { id, userId },
    data: { isDefault: true },
  });
}
