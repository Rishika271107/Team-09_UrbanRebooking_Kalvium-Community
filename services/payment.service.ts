import { prisma } from "@/lib/prisma";

export type PaymentMethodStub = {
  id: string;
  userId: string;
  cardType: string;
  lastFour: string;
  provider: string;
  isDefault: boolean;
  createdAt: Date;
};

export async function getUserPaymentMethods(userId: string): Promise<PaymentMethodStub[]> {
  return prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addPaymentMethod(
  userId: string,
  data: { cardType: string; lastFour: string; provider: string; isDefault?: boolean }
): Promise<PaymentMethodStub> {
  const isFirst = (await prisma.paymentMethod.count({ where: { userId } })) === 0;
  const isDefault = data.isDefault || isFirst;

  if (isDefault && !isFirst) {
    await prisma.paymentMethod.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.paymentMethod.create({
    data: {
      userId,
      cardType: data.cardType,
      lastFour: data.lastFour,
      provider: data.provider,
      isDefault,
    },
  });
}

export async function deletePaymentMethod(id: string, userId: string): Promise<PaymentMethodStub | null> {
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method || method.userId !== userId) return null;

  const deleted = await prisma.paymentMethod.delete({
    where: { id },
  });

  if (deleted.isDefault) {
    const nextDefault = await prisma.paymentMethod.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (nextDefault) {
      await prisma.paymentMethod.update({
        where: { id: nextDefault.id },
        data: { isDefault: true },
      });
    }
  }

  return deleted;
}

export async function setDefaultPaymentMethod(id: string, userId: string): Promise<PaymentMethodStub | null> {
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method || method.userId !== userId) return null;

  await prisma.paymentMethod.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.paymentMethod.update({
    where: { id },
    data: { isDefault: true },
  });
}
