"use server";

import { revalidatePath } from "next/cache";
import { updateUserProfile, updateUserPassword } from "@/services/user.service";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function updateProfile(data: { fullName: string; email: string; phone: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await updateUserProfile(session.user.id, {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
    });
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updatePassword(password: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(session.user.id, hashedPassword);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
