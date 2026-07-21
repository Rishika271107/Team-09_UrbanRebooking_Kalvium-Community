"use server";

import { revalidatePath } from "next/cache";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications } from "@/services/notification.service";
import { auth } from "@/auth";

export async function markAsReadAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await markNotificationAsRead(id, session.user.id);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markAllAsReadAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await markAllNotificationsAsRead(session.user.id);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await deleteNotification(id, session.user.id);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function clearAllNotificationsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await clearAllNotifications(session.user.id);
    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
