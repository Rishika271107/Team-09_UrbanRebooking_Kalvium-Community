"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { processRebook } from "@/services/rebook.service";
import { getBookingById } from "@/services/booking.service";
import { logRebookCreated, logUnexpectedError } from "@/lib/logger";

const rebookSchema = z.object({
  originalBookingId: z.string().min(1, "Original booking ID is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  addressId: z.string().min(1, "Address is required"),
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

    const { originalBookingId, date, time, addressId, paymentMethod } = parsed.data;

    const originalBooking = await getBookingById(originalBookingId);
    if (!originalBooking) {
      return { error: "Original booking not found" };
    }

    if (originalBooking.userId !== userId) {
      return { error: "Unauthorized access to this booking" };
    }

    const newBooking = await processRebook({
      userId,
      originalBookingId,
      serviceId: originalBooking.serviceId,
      professionalId: originalBooking.professionalId || "",
      addressId,
      date,
      time,
      paymentMethod,
      serviceName: originalBooking.service.name,
      professionalName: originalBooking.professional?.user?.name ?? "Professional",
    });

    logRebookCreated(userId, originalBookingId, newBooking.id);
    return { success: true, newBookingId: newBooking.id };
  } catch (error: unknown) {
    logUnexpectedError("rebookAction", error);
    return { error: "An unexpected error occurred during rebooking." };
  }
}
