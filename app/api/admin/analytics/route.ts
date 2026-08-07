import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only admin accounts can access analytics." },
      { status: 403 }
    );
  }

  try {
    const [rebookingOutcomes, bookingStatusBreakdown, slotTypeBreakdown, professionals] =
      await Promise.all([
        prisma.rebookingEvent.groupBy({
          by: ["outcome"],
          _count: { outcome: true },
        }),
        prisma.booking.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.calendarSlot.groupBy({
          by: ["slotType"],
          _count: { slotType: true },
        }),
        prisma.professional.findMany({
          include: {
            user: { select: { name: true } },
            _count: { select: { bookings: true, calendarSlots: true } },
            calendarSlots: { where: { slotType: "BOOKED" }, select: { id: true } },
          },
        }),
      ]);

    const totalRebookingEvents = rebookingOutcomes.reduce((sum, o) => sum + o._count.outcome, 0);
    const successfulRebookings =
      rebookingOutcomes.find((o) => o.outcome === "SUCCESS")?._count.outcome ?? 0;
    const rebookingSuccessRate =
      totalRebookingEvents > 0 ? successfulRebookings / totalRebookingEvents : 0;

    const professionalUtilization = professionals.map((p) => {
      const totalSlots = p._count.calendarSlots;
      const bookedSlots = p.calendarSlots.length;
      return {
        professionalId: p.id,
        name: p.user.name,
        active: p.active,
        totalSlots,
        bookedSlots,
        utilizationPct: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0,
      };
    });

    return NextResponse.json({
      totals: {
        totalRebookingEvents,
        successfulRebookings,
        rebookingSuccessRate,
      },
      rebookingOutcomes: rebookingOutcomes.map((o) => ({
        outcome: o.outcome,
        count: o._count.outcome,
      })),
      bookingStatusBreakdown: bookingStatusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      slotTypeBreakdown: slotTypeBreakdown.map((s) => ({
        slotType: s.slotType,
        count: s._count.slotType,
      })),
      professionalUtilization,
    });
  } catch (err) {
    console.error("Fetch /admin/analytics error:", err);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}
