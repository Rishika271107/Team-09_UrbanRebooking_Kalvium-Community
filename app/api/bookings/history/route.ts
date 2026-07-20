import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: [{ slotStart: "desc" }, { createdAt: "desc" }],
      include: {
        service: true,
        professional: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    const withEligibility = bookings.map((booking) => ({
      ...booking,
      // FR1: only eligible services surface a "Rebook" action.
      eligibleForRebook: booking.status === "COMPLETED",
    }));

    return NextResponse.json({ bookings: withEligibility });
  } catch (err) {
    console.error("Fetch /bookings/history error:", err);
    return NextResponse.json({ error: "Failed to load booking history." }, { status: 500 });
  }
}
