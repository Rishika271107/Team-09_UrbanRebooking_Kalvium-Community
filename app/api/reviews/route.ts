import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createReview } from "@/services/review.service";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid review data." },
        { status: 400 }
      );
    }

    // Fetch booking to get professionalId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { professional: true },
    });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (!booking.professional) {
      return NextResponse.json(
        { error: "No professional assigned to this booking." },
        { status: 400 }
      );
    }

    const review = await createReview(session.user.id, {
      professionalId: booking.professional.id,
      bookingId,
      rating,
      reviewText: comment,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to submit review." },
      { status: 500 }
    );
  }
}
