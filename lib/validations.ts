import { z } from "zod";

// ── Profile ───────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ── Address ───────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  addressLine: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Pincode is required"),
});

// ── Payment ───────────────────────────────────────────────────────────────────

export const paymentMethodSchema = z.object({
  type: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI"], {
    error: "Invalid payment type",
  }),
  label: z.string().min(1, "Label is required"),
  last4: z.string().optional(),
  upiId: z.string().optional(),
});

// ── Rebook ────────────────────────────────────────────────────────────────────

export const rebookSchema = z.object({
  originalBookingId: z.string().min(1, "Original booking ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  addressId: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"]),
});

// ── Review ────────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  professionalId: z.string().min(1),
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(1000).optional(),
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type RebookInput = z.infer<typeof rebookSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
