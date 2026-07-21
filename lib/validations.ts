import { z } from "zod";

// ── Auth / Registration ───────────────────────────────────────────────────────

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

// ── Profile ───────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type PasswordInput = z.infer<typeof passwordSchema>;

// ── Address ───────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  addressLine: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Pincode is required"),
});
export type AddressInput = z.infer<typeof addressSchema>;

// ── Payment ───────────────────────────────────────────────────────────────────

export const paymentMethodSchema = z.object({
  type: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI"] as const, {
    error: "Invalid payment type",
  }),
  label: z.string().min(1, "Label is required"),
  last4: z.string().optional(),
  upiId: z.string().optional(),
});
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

// ── Rebook ────────────────────────────────────────────────────────────────────

export const rebookSchema = z.object({
  originalBookingId: z.string().min(1, "Original booking ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  addressId: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"] as const),
});
export type RebookInput = z.infer<typeof rebookSchema>;

// ── Review ────────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  bookingId: z.string().min(1),
  professionalId: z.string().min(1),
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(1000).optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

// ── Booking (incoming schema) ─────────────────────────────────────────────────

export const confirmBookingSchema = z
  .object({
    bookingId: z.string().min(1, "bookingId is required."),
    professionalId: z.string().min(1, "professionalId is required."),
    slotStart: z.string().min(1, "slotStart is required."),
    slotEnd: z.string().min(1, "slotEnd is required."),
  })
  .refine(
    (data) => {
      const start = new Date(data.slotStart);
      const end = new Date(data.slotEnd);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
    },
    { message: "slotStart must be a valid date before slotEnd.", path: ["slotStart"] }
  );
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format."),
});
