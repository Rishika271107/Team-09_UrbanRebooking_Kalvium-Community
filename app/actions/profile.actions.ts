"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUserProfile, updateUserPassword } from "@/services/user.service";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateProfile(data: { fullName: string; email: string; phone: string }) {
  try {
    const userId = await requireUserId();
    await updateUserProfile(userId, data);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updatePassword(password: string) {
  try {
    const userId = await requireUserId();
    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(userId, hashedPassword);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
