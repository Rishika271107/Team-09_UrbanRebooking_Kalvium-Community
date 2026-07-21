import { prisma } from "@/lib/prisma";

export async function getUserPaymentMethods(userId: string) {
  return await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });
}

export async function createPaymentMethod(userId: string, data: { type: string; last4?: string; provider?: string; isDefault?: boolean }) {
  if (data.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const count = await prisma.paymentMethod.count({ where: { userId } });
  const isDefault = data.isDefault || count === 0;

  return await prisma.paymentMethod.create({
    data: {
      userId,
      ...data,
      isDefault,
    },
  });
}

export async function deletePaymentMethod(id: string, userId: string) {
  return await prisma.paymentMethod.delete({
    where: { id, userId },
  });
}

export async function setDefaultPaymentMethod(id: string, userId: string) {
  await prisma.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return await prisma.paymentMethod.update({
    where: { id, userId },
    data: { isDefault: true },
  });
}
