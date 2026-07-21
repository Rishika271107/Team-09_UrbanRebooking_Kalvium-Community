"use server";

import { revalidatePath } from "next/cache";
import { createPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } from "@/services/payment.service";
import { auth } from "@/auth";

export async function addPaymentMethodAction(data: { type: string; last4?: string; provider?: string; isDefault?: boolean }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await createPaymentMethod(session.user.id, data);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deletePaymentMethodAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await deletePaymentMethod(id, session.user.id);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function setDefaultPaymentMethodAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await setDefaultPaymentMethod(id, session.user.id);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
