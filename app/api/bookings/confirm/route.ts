import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { confirmBookingSchema } from "@/lib/validations";

class SlotUnavailableError extends Error {}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = confirmBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { bookingId, professionalId, slotStart, slotEnd } = parsed.data;
  const start = new Date(slotStart);
  const end = new Date(slotEnd);

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "This booking has already been confirmed." },
        { status: 409 }
      );
    }

    if (booking.status !== "DRAFT" && booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "This booking can no longer be confirmed." },
        { status: 400 }
      );
    }

    const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
    if (!professional || !professional.active) {
      return NextResponse.json(
        { error: "The selected professional is unavailable." },
        { status: 409 }
      );
    }

    // FR6: revalidate the slot at confirmation time to avoid double-booking.
    // The updateMany's WHERE clause (slotType: AVAILABLE) is what makes this
    // atomic: if two requests race for the same slot, only the first row lock
    // wins and flips it to BOOKED; the loser's updateMany matches 0 rows.
    const confirmedBooking = await prisma.$transaction(async (tx) => {
      const slotUpdate = await tx.calendarSlot.updateMany({
        where: {
          professionalId,
          startTime: start,
          endTime: end,
          slotType: "AVAILABLE",
        },
        data: { slotType: "BOOKED" },
      });

      if (slotUpdate.count === 0) {
        throw new SlotUnavailableError("Slot is no longer available.");
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          professionalId,
          slotStart: start,
          slotEnd: end,
          status: "CONFIRMED",
        },
        include: {
          service: true,
          professional: { include: { user: { select: { name: true } } } },
        },
      });

      const slot = await tx.calendarSlot.findFirst({
        where: { professionalId, startTime: start, endTime: end },
      });
      if (slot) {
        await tx.calendarSlot.update({
          where: { id: slot.id },
          data: { bookingId: updated.id },
        });
      }

      return updated;
    });

    return NextResponse.json({ booking: confirmedBooking }, { status: 200 });
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      // FR8: slot blocked after initial selection.
      return NextResponse.json(
        { error: "That slot was just booked or blocked. Please choose another slot." },
        { status: 409 }
      );
    }
    console.error("Confirm booking error:", err);
    return NextResponse.json(
      { error: "Failed to confirm the booking. Please try again." },
      { status: 500 }
    );
  }
}
