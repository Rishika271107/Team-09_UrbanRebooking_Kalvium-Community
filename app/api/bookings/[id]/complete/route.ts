import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createNotification } from "@/services/notification.service";

// Marks a CONFIRMED booking as COMPLETED. Only the assigned professional
// (or an admin, for support cases) can do this — a customer can't
// self-certify that a job was done.
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { professional: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const isAssignedProfessional =
      session.user.role === "PROFESSIONAL" && booking.professional?.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAssignedProfessional && !isAdmin) {
      return NextResponse.json(
        { error: "Only the assigned professional or an admin can mark this booking complete." },
        { status: 403 }
      );
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be marked complete." },
        { status: 400 }
      );
    }

    const completed = await prisma.booking.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    await createNotification(
      booking.userId,
      "Service completed",
      "Your service has been marked as completed. You can now rebook or leave a review."
    );

    return NextResponse.json({ booking: completed });
  } catch (err) {
    console.error("Complete booking error:", err);
    return NextResponse.json({ error: "Failed to mark the booking complete." }, { status: 500 });
  }
}
