import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  try {
    // Verify booking belongs to this user and is cancellable
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only upcoming bookings can be cancelled." },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json(
      { error: "Failed to cancel booking." },
      { status: 500 }
    );
  }
}
