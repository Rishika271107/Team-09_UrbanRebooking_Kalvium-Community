import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let professionalId: string | null = null;
    if (session.user.role === "PROFESSIONAL") {
      const pro = await prisma.professional.findUnique({
        where: { userId: session.user.id },
      });
      if (pro) {
        professionalId = pro.id;
      } else {
        return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
      }
    }

    const body = await req.json();
    const { startTime, endTime, reason } = body;

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Start and end times are required" }, { status: 400 });
    }

    // Admin must supply professionalId explicitly; fall back to first pro if missing
    if (!professionalId) {
      professionalId = body.professionalId;
      if (!professionalId) {
        // Auto-select the first professional as fallback
        const firstPro = await prisma.professional.findFirst({ select: { id: true } });
        if (!firstPro) {
          return NextResponse.json({ error: "No professionals found. Please add a professional first." }, { status: 400 });
        }
        professionalId = firstPro.id;
      }
    }

    const blockStart = new Date(startTime);
    const blockEnd = new Date(endTime);

    // ── Cancel overlapping PENDING bookings and notify those customers ──────
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        professionalId,
        status: "PENDING",
        slotStart: { lt: blockEnd },
        slotEnd:   { gt: blockStart },
      },
      include: {
        service: true,
        user: { select: { id: true, name: true } },
      },
    });

    for (const b of overlappingBookings) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { status: "CANCELLED" },
      });
      // Free the calendar slot
      if (b.id) {
        await prisma.calendarSlot.updateMany({
          where: { bookingId: b.id },
          data: { slotType: "AVAILABLE", bookingId: null },
        });
      }
      // Notify the customer their booking was cancelled due to unavailability
      await createNotification(
        b.user.id,
        "⚠️ Booking Cancelled",
        `Your ${b.service.name} booking was cancelled because the professional blocked that time slot. Please rebook at your convenience.`,
        "BOOKING_CANCELLED",
        "alert-triangle"
      );
    }

    // ── Block or create the slot ─────────────────────────────────────────────
    const existing = await prisma.calendarSlot.findFirst({
      where: {
        professionalId,
        startTime: blockStart,
        endTime: blockEnd,
      },
    });

    let slot;
    if (existing) {
      if (existing.bookingId) {
        return NextResponse.json({ error: "Slot is already booked." }, { status: 400 });
      }
      slot = await prisma.calendarSlot.update({
        where: { id: existing.id },
        data: { slotType: "BLOCKED" },
      });
    } else {
      slot = await prisma.calendarSlot.create({
        data: {
          professionalId,
          startTime: blockStart,
          endTime: blockEnd,
          slotType: "BLOCKED",
        },
      });
    }

    return NextResponse.json({
      slot,
      cancelledBookings: overlappingBookings.length,
    });
  } catch (error) {
    console.error("Error blocking calendar slot:", error);
    return NextResponse.json({ error: "Failed to block calendar slot" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
    
        if (!id) {
          return NextResponse.json({ error: "Slot ID is required" }, { status: 400 });
        }
    
        const slot = await prisma.calendarSlot.findUnique({
            where: { id }
        });

        if (!slot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        // Verify ownership for professionals
        if (session.user.role === "PROFESSIONAL") {
            const pro = await prisma.professional.findUnique({
                where: { userId: session.user.id }
            });
            if (!pro || slot.professionalId !== pro.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        // Delete or mark available
        await prisma.calendarSlot.delete({
            where: { id }
        });
    
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("Error unblocking calendar slot:", error);
        return NextResponse.json({ error: "Failed to unblock calendar slot" }, { status: 500 });
      }
}
