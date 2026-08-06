"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/services/notification.service";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function markAsReadAction(id: string) {
  try {
    const userId = await requireUserId();
    await markNotificationAsRead(id, userId);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markAllAsReadAction() {
  try {
    const userId = await requireUserId();
    await markAllNotificationsAsRead(userId);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    const userId = await requireUserId();
    await deleteNotification(id, userId);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function clearAllNotificationsAction() {
  try {
    const userId = await requireUserId();
    await clearAllNotifications(userId);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
