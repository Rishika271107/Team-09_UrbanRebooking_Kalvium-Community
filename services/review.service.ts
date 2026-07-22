import { prisma } from "@/lib/prisma";
import { logReviewSubmitted, logDbError } from "@/lib/logger";

/**
 * Review model does not exist in the current schema.
 * These functions stub the interface to prevent build errors.
 */

export type ReviewStub = {
  id: string;
  userId: string;
  professionalId: string;
  bookingId: string;
  rating: number;
  reviewText?: string;
  createdAt: Date;
};

export async function createReview(
  userId: string,
  data: { professionalId: string; bookingId: string; rating: number; reviewText?: string }
): Promise<ReviewStub> {
  // Ensure booking is completed
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
  });

  if (!booking || booking.status !== "COMPLETED") {
    throw new Error("Only completed bookings can be reviewed.");
  }

  await prisma.professional.update({
    where: { id: data.professionalId },
    data: {
      rating: data.rating, // Just use the latest rating
    },
  });

  logReviewSubmitted(userId, data.bookingId, data.rating);

  return {
    id: "stub-" + Date.now(),
    userId,
    ...data,
    createdAt: new Date(),
  };
}

export async function getReviewForBooking(_bookingId: string): Promise<ReviewStub | null> {
  return null;
}
