import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { confirmBookingSchema } from "@/lib/validations";

class SlotUnavailableError extends Error {}
class ProfessionalUnavailableError extends Error {}

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

    // Authorization: the client can only confirm with the professional that
    // was actually assigned to this draft (e.g. by /bookings/:id/rebook).
    // Without this check, a client could pass any active professional's id
    // and confirm a booking against someone who was never offered this job.
    if (!booking.professionalId) {
      return NextResponse.json(
        {
          error:
            "This booking has no assigned professional yet, so it can't be confirmed. Please start a new rebooking request.",
        },
        { status: 400 }
      );
    }
    if (booking.professionalId !== professionalId) {
      return NextResponse.json(
        { error: "The selected professional doesn't match this booking." },
        { status: 403 }
      );
    }

    // FR6: revalidate the slot AND the professional's active status at
    // confirmation time, inside the same transaction, to avoid double-booking
    // and to shrink the time-of-check/time-of-use window on professional.active.
    const confirmedBooking = await prisma.$transaction(
      async (tx) => {
        const professional = await tx.professional.findUnique({
          where: { id: professionalId },
        });
        if (!professional || !professional.active) {
          throw new ProfessionalUnavailableError("Professional is unavailable.");
        }

        // The updateMany's WHERE clause (slotType: AVAILABLE) is what makes
        // this atomic: if two requests race for the same slot, Postgres's
        // Read Committed UPDATE re-checks the WHERE clause against the
        // latest committed row after acquiring the row lock, so only the
        // first request's updateMany matches a row; the loser gets count 0.
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
      },
      { timeout: 10_000, maxWait: 5_000 }
    );

    return NextResponse.json({ booking: confirmedBooking }, { status: 200 });
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      // FR8: slot blocked/booked after the customer initially selected it.
      return NextResponse.json(
        { error: "That slot was just booked or blocked. Please choose another slot." },
        { status: 409 }
      );
    }

    if (err instanceof ProfessionalUnavailableError) {
      return NextResponse.json(
        { error: "The selected professional is no longer available." },
        { status: 409 }
      );
    }

    // Prisma interactive transaction timed out or failed to acquire a slot
    // under contention (P2028) — this is a "please retry," not a server
    // failure, so it deserves a 409 rather than a generic 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2028") {
      return NextResponse.json(
        { error: "The system is busy processing this slot. Please try again." },
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
