import { prisma } from "@/lib/prisma";

interface RebookParams {
  userId: string;
  originalBookingId: string;
  serviceId: string;
  professionalId: string;
  addressId: string;
  phone: string;
  date: string;
  time: string;
  paymentMethod: string;
  serviceName: string;
  professionalName: string;
}

export async function processRebook(params: RebookParams) {
  // Parse date + time into a slotStart DateTime
  const slotStart = new Date(`${params.date}T${params.time}:00`);

  // Use Prisma transaction to guarantee all inserts succeed or fail together
  return await prisma.$transaction(async (tx) => {
    // 0. Update user's phone number
    if (params.phone) {
      await tx.user.update({
        where: { id: params.userId },
        data: { phone: params.phone }
      });
    }

    // 1. Create the new booking sourced from the original
    const newBooking = await tx.booking.create({
      data: {
        userId: params.userId,
        serviceId: params.serviceId,
        professionalId: params.professionalId || undefined,
        address: params.addressId, // stored as a string address
        slotStart,
        status: "PENDING",
        sourceBookingId: params.originalBookingId,
      },
    });

    // 2. Record the rebooking event for analytics / traceability (FR9)
    await tx.rebookingEvent.create({
      data: {
        sourceBookingId: params.originalBookingId,
        newBookingId: newBooking.id,
        outcome: "SUCCESS",
      },
    });

    return newBooking;
  });
}
