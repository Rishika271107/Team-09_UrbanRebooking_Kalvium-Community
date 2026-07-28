import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const rateLimit = checkRateLimit(`bookings:rebook:${session.user.id}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many rebooking attempts. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "A booking id is required." }, { status: 400 });
  }

  try {
    const sourceBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        professional: true,
      },
    });

    if (!sourceBooking || sourceBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // FR8: previous service no longer eligible for rebooking.
    if (sourceBooking.status !== "COMPLETED") {
      await prisma.rebookingEvent.create({
        data: { sourceBookingId: sourceBooking.id, outcome: "SERVICE_INELIGIBLE" },
      });
      return NextResponse.json(
        { error: "This booking is not eligible for rebooking." },
        { status: 400 }
      );
    }

    // FR3: attempt to reuse the same professional, if they're still active.
    let professionalAvailable = false;
    let professionalId: string | null = null;

    if (sourceBooking.professionalId) {
      professionalAvailable = !!sourceBooking.professional?.active;
      if (professionalAvailable) {
        professionalId = sourceBooking.professionalId;
      }
    }

    const draftBooking = await prisma.$transaction(async (tx) => {
      const draft = await tx.booking.create({
        data: {
          userId: session.user.id,
          professionalId,
          serviceId: sourceBooking.serviceId,
          address: sourceBooking.address,
          status: "DRAFT",
          sourceBookingId: sourceBooking.id,
        },
        include: {
          service: true,
          professional: { include: { user: { select: { name: true } } } },
        },
      });

      await tx.rebookingEvent.create({
        data: {
          sourceBookingId: sourceBooking.id,
          newBookingId: draft.id,
          outcome: professionalAvailable ? "SUCCESS" : "PROFESSIONAL_UNAVAILABLE",
        },
      });

      return draft;
    });

    return NextResponse.json(
      {
        draftBooking,
        professionalAvailable,
        message: professionalAvailable
          ? "Draft booking created with your previous professional. Pick a slot to confirm."
          : "Your previous professional is unavailable. Please choose another date or slot.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Rebook error:", err);
    return NextResponse.json(
      { error: "Failed to create the rebooking draft. Please try again." },
      { status: 500 }
    );
  }
}
