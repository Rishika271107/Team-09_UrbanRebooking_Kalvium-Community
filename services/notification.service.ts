import { prisma } from "@/lib/prisma";

export type NotificationStub = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  readStatus: boolean;
  iconName: string;
  createdAt: Date;
};

export async function getUserNotifications(userId: string): Promise<NotificationStub[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string, userId: string): Promise<NotificationStub | null> {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) return null;

  return prisma.notification.update({
    where: { id },
    data: { readStatus: true },
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: { userId, readStatus: false },
    data: { readStatus: true },
  });
  return { count: result.count };
}

export async function deleteNotification(id: string, userId: string): Promise<NotificationStub | null> {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) return null;

  return prisma.notification.delete({
    where: { id },
  });
}

export async function clearAllNotifications(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });
  return { count: result.count };
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string = "update",
  iconName: string = "bell"
): Promise<NotificationStub | null> {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      iconName,
    },
  });
}
