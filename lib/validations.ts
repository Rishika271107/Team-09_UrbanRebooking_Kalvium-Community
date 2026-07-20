import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

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
