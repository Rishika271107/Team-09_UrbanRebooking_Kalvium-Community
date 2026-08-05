import { prisma } from "@/lib/prisma";
import { logReviewSubmitted } from "@/lib/logger";

interface ReviewInput {
  bookingId: string;
  professionalId: string;
  rating: number;
  reviewText?: string;
}

export async function createReview(userId: string, data: ReviewInput) {
  const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });

  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }
  if (booking.status !== "COMPLETED") {
    throw new Error("Only completed bookings can be reviewed.");
  }
  if (booking.professionalId !== data.professionalId) {
    throw new Error("The selected professional doesn't match this booking.");
  }

  const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
  if (existing) {
    throw new Error("This booking has already been reviewed.");
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        userId,
        bookingId: data.bookingId,
        professionalId: data.professionalId,
        rating: data.rating,
        reviewText: data.reviewText,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: { professionalId: data.professionalId },
      _avg: { rating: true },
    });

    await tx.professional.update({
      where: { id: data.professionalId },
      data: { rating: aggregate._avg.rating ?? data.rating },
    });

    return created;
  });

  logReviewSubmitted(userId, data.bookingId, data.rating);
  return review;
}

export async function getReviewForBooking(bookingId: string) {
  return prisma.review.findUnique({ where: { bookingId } });
}
