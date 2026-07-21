"use server";

import { revalidatePath } from "next/cache";
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/services/address.service";
import { auth } from "@/auth";

export async function addAddressAction(data: { addressLine: string; city: string; state: string; pincode: string; isDefault?: boolean }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await createAddress(session.user.id, data);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAddressAction(id: string, data: { addressLine: string; city: string; state: string; pincode: string; isDefault?: boolean }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await updateAddress(id, session.user.id, data);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await deleteAddress(id, session.user.id);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function setDefaultAddressAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await setDefaultAddress(id, session.user.id);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
