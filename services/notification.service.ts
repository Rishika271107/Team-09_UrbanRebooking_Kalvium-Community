import { prisma } from "@/lib/prisma";

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { readStatus: true },
  });
  if (result.count === 0) {
    throw new Error("Notification not found.");
  }
  return prisma.notification.findUnique({ where: { id } });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readStatus: false },
    data: { readStatus: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  const result = await prisma.notification.deleteMany({ where: { id, userId } });
  if (result.count === 0) {
    throw new Error("Notification not found.");
  }
  return { id };
}

export async function clearAllNotifications(userId: string) {
  return prisma.notification.deleteMany({ where: { userId } });
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type = "GENERAL",
  iconName = "bell"
) {
  return prisma.notification.create({
    data: { userId, title, message, type, iconName },
  });
}

