import { NextRequest, NextResponse } from "next/server";
import { getUserBookingsPaginated } from "@/services/booking.service";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const take = 10;
  const skip = (page - 1) * take;

  try {
    const { bookings, total } = await getUserBookingsPaginated(session.user.id, skip, take);

    // Compute eligibleForRebook: a COMPLETED booking with an active professional
    const enrichedBookings = bookings.map((b) => ({
      ...b,
      eligibleForRebook:
        b.status === "COMPLETED" && (b.professional?.active ?? false),
    }));

    return NextResponse.json(
      { bookings: enrichedBookings, total, page, pageSize: take },
      { status: 200 }
    );
  } catch (err) {
    console.error("Bookings history error:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking history." },
      { status: 500 }
    );
  }
}