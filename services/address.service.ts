import { prisma } from "@/lib/prisma";

/**
 * Address model does not exist in the current schema.
 * The User model has a single `address: String?` field.
 * These functions stub the multi-address interface to prevent build errors.
 */

export type AddressStub = {
  id: string;
  userId: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export async function getUserAddresses(userId: string): Promise<AddressStub[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.address) return [];
  return [
    {
      id: "primary",
      userId,
      addressLine: user.address,
      city: "",
      state: "",
      pincode: "",
      isDefault: true,
    },
  ];
}

export async function createAddress(
  userId: string,
  data: { addressLine: string; city: string; state: string; pincode: string; isDefault?: boolean }
): Promise<AddressStub> {
  const fullAddress = `${data.addressLine}, ${data.city}, ${data.state} - ${data.pincode}`;
  await prisma.user.update({ where: { id: userId }, data: { address: fullAddress } });
  return { id: "primary", userId, ...data, isDefault: true };
}

export async function updateAddress(
  _id: string,
  userId: string,
  data: { addressLine: string; city: string; state: string; pincode: string; isDefault?: boolean }
): Promise<AddressStub> {
  const fullAddress = `${data.addressLine}, ${data.city}, ${data.state} - ${data.pincode}`;
  await prisma.user.update({ where: { id: userId }, data: { address: fullAddress } });
  return { id: "primary", userId, ...data, isDefault: true };
}

export async function deleteAddress(_id: string, userId: string): Promise<AddressStub | null> {
  await prisma.user.update({ where: { id: userId }, data: { address: null } });
  return null;
}

export async function setDefaultAddress(_id: string, userId: string): Promise<AddressStub | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.address) return null;
  return { id: "primary", userId, addressLine: user.address, city: "", state: "", pincode: "", isDefault: true };
}
