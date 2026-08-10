"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { getBookingById } from "@/services/booking.service";
import { logger } from "@/lib/logger";

const rebookSchema = z.object({
  originalBookingId: z.string().min(1, "Original booking ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  addressId: z.string().min(1, "Address is required"),
  phone: z.string().min(10, "Phone number is required"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "CASH"]),
});

export async function rebookAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }
    const userId = session.user.id;

    const data = Object.fromEntries(formData.entries());
    const parsed = rebookSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { originalBookingId } = parsed.data;

    const originalBooking = await getBookingById(originalBookingId);
    if (!originalBooking) {
      return { error: "Original booking not found" };
    }

    if (originalBooking.userId !== userId) {
      return { error: "Unauthorized access to this booking" };
    }

    return { success: true };
  } catch (error: unknown) {
    logger.error("rebookAction error", { error: String(error) });
    return { error: "An unexpected error occurred during rebooking." };
  }
}
