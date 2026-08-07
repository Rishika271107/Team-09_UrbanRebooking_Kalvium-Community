"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/services/address.service";

interface AddressData {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function addAddressAction(data: AddressData) {
  try {
    const userId = await requireUserId();
    await createAddress(userId, data);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAddressAction(id: string, data: AddressData) {
  try {
    const userId = await requireUserId();
    await updateAddress(id, userId, data);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    const userId = await requireUserId();
    await deleteAddress(id, userId);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function setDefaultAddressAction(id: string) {
  try {
    const userId = await requireUserId();
    await setDefaultAddress(id, userId);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
