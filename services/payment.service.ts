/**
 * PaymentMethod model does not exist in the current schema.
 * These functions stub the interface to prevent build errors.
 */

export type PaymentMethodStub = {
  id: string;
  userId: string;
  type: string;
  last4?: string;
  provider?: string;
  isDefault: boolean;
};

export async function getUserPaymentMethods(_userId: string): Promise<PaymentMethodStub[]> {
  return [];
}

export async function createPaymentMethod(
  _userId: string,
  _data: { type: string; last4?: string; provider?: string; isDefault?: boolean }
): Promise<PaymentMethodStub | null> {
  return null;
}

export async function deletePaymentMethod(
  _id: string,
  _userId: string
): Promise<PaymentMethodStub | null> {
  return null;
}

export async function setDefaultPaymentMethod(
  _id: string,
  _userId: string
): Promise<PaymentMethodStub | null> {
  return null;
}
