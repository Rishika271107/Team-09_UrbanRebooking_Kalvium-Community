import { prisma } from "@/lib/prisma";

interface RebookParams {
  userId: string;
  originalBookingId: string;
  serviceId: string;
  professionalId: string;
  addressId: string;
  date: string;
  time: string;
  price: number;
  paymentMethod: string;
  serviceName: string;
  professionalName: string;
}

export async function processRebook(params: RebookParams) {
  // Use Prisma transaction to guarantee all inserts succeed or fail together
  return await prisma.$transaction(async (tx) => {
    // 1. Create the new booking
    const newBooking = await tx.booking.create({
      data: {
        customerId: params.userId,
        serviceId: params.serviceId,
        professionalId: params.professionalId,
        addressId: params.addressId,
        date: params.date,
        time: params.time,
        status: "UPCOMING",
        price: params.price,
      },
    });

    // 2. Create RebookHistory
    await tx.rebookHistory.create({
      data: {
        originalBookingId: params.originalBookingId,
        newBookingId: newBooking.id,
      },
    });

    // 3. Create mock Payment
    await tx.payment.create({
      data: {
        bookingId: newBooking.id,
        amount: params.price,
        paymentMethod: params.paymentMethod,
        status: "SUCCESS",
      },
    });

    // 4. Create Activity
    await tx.activity.create({
      data: {
        userId: params.userId,
        title: `Rebooked ${params.serviceName}`,
        type: "REBOOK",
        professionalName: params.professionalName,
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      },
    });

    // 5. Create Notification
    await tx.notification.create({
      data: {
        userId: params.userId,
        title: "Booking Confirmed",
        message: `Your rebooking for ${params.serviceName} with ${params.professionalName} on ${params.date} at ${params.time} is confirmed.`,
        readStatus: false,
      },
    });

    return newBooking;
  });
}
