import { prisma } from "@/lib/prisma";
import { logReviewSubmitted, logDbError } from "@/lib/logger";

export async function createReview(userId: string, data: { professionalId: string; bookingId: string; rating: number; reviewText?: string }) {
  // Ensure booking is completed
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
  });

  if (!booking || booking.status !== "COMPLETED") {
    throw new Error("Only completed bookings can be reviewed.");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      userId,
      ...data,
    },
  });

  // Recalculate professional rating and jobs completed
  const allReviews = await prisma.review.findMany({
    where: { professionalId: data.professionalId },
  });

  const totalReviews = allReviews.length;
  const sumRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : 0;

  // We consider "jobsCompleted" to be the count of COMPLETED bookings or total reviews. Let's base it on completed bookings or keep it simple.
  // Actually, we should just increment jobsCompleted or calculate it from bookings.
  const jobsCompletedCount = await prisma.booking.count({
    where: { professionalId: data.professionalId, status: "COMPLETED" },
  });

  await prisma.professional.update({
    where: { id: data.professionalId },
    data: {
      rating: parseFloat(averageRating.toString()),
      jobsCompleted: jobsCompletedCount,
    },
  });

  logReviewSubmitted(userId, data.bookingId, data.rating);
  return review;
}

export async function getReviewForBooking(bookingId: string) {
  return await prisma.review.findUnique({
    where: { bookingId },
  });
}
