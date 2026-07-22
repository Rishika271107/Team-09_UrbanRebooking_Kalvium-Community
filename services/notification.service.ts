import { prisma } from "@/lib/prisma";

/**
 * Notification model does not exist in the current schema.
 * These functions stub the interface to prevent build errors while keeping
 * call-sites intact. Notifications can be surfaced via RebookingEvent instead.
 */

export type NotificationStub = {
  id: string;
  userId: string;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: Date;
};

export async function getUserNotifications(_userId: string): Promise<NotificationStub[]> {
  return [];
}

export async function markNotificationAsRead(_id: string, _userId: string): Promise<NotificationStub | null> {
  return null;
}

export async function markAllNotificationsAsRead(_userId: string): Promise<{ count: number }> {
  return { count: 0 };
}

export async function deleteNotification(_id: string, _userId: string): Promise<NotificationStub | null> {
  return null;
}

export async function clearAllNotifications(_userId: string): Promise<{ count: number }> {
  return { count: 0 };
}

export async function createNotification(
  _userId: string,
  _title: string,
  _message: string
): Promise<NotificationStub | null> {
  return null;
}
