import { prisma } from "@/lib/prisma";

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return await prisma.notification.update({
    where: { id, userId },
    data: { readStatus: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId, readStatus: false },
    data: { readStatus: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  return await prisma.notification.delete({
    where: { id, userId },
  });
}

export async function clearAllNotifications(userId: string) {
  return await prisma.notification.deleteMany({
    where: { userId },
  });
}

export async function createNotification(userId: string, title: string, message: string) {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
}
