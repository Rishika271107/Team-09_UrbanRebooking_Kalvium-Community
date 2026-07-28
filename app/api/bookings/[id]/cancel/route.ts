import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createNotification } from "@/services/notification.service";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (!["DRAFT", "PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "This booking can no longer be cancelled." },
        { status: 400 }
      );
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      // Free up the calendar slot, if one was reserved for this booking.
      await tx.calendarSlot.updateMany({
        where: { bookingId: id },
        data: { slotType: "AVAILABLE", bookingId: null },
      });

      return updated;
    });

    await createNotification(
      session.user.id,
      "Booking cancelled",
      `Your booking for ${new Date().toLocaleDateString()} has been cancelled.`
    );

    return NextResponse.json({ booking: cancelled });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json({ error: "Failed to cancel the booking." }, { status: 500 });
  }
}
