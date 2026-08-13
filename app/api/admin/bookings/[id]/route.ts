import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { z } from "zod";

const patchBookingSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "DISPUTED"]),
  professionalId: z.string().optional(),
});

async function ensureAdminOrPro() {
  const { session, error } = await requireSession();
  if (error) return { error };
  if (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL") {
    return {
      error: NextResponse.json({ error: "Access denied. Admins and Professionals only." }, { status: 403 }),
    };
  }
  return { session };
}

// ── PATCH /api/admin/bookings/[id] (Force updates on booking status or assignments) ───────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await ensureAdminOrPro();
  if (error) return error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing booking ID." }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = patchBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Role-based authorization check
    if (session.user.role === "PROFESSIONAL") {
      const pro = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      });
      // Allow modifying if assigned, or if the booking is not assigned to anyone yet (taking request)
      if (!pro || (booking.professionalId && booking.professionalId !== pro.id)) {
        return NextResponse.json({ error: "Not authorized to modify this booking." }, { status: 403 });
      }
      
      // If professionalId is being updated and it's not the current professional's id, deny
      if (parsed.data.professionalId && parsed.data.professionalId !== pro.id) {
        return NextResponse.json({ error: "Cannot assign to another professional." }, { status: 403 });
      }
      
      // Automatically set the professional ID if taking an unassigned request
      if (!booking.professionalId && parsed.data.status === "CONFIRMED") {
        parsed.data.professionalId = pro.id;
      }
    }

    // If professionalId is changing, ensure they exist first
    if (parsed.data.professionalId) {
      const professionalExists = await prisma.professional.findUnique({
        where: { id: parsed.data.professionalId },
      });
      if (!professionalExists) {
        return NextResponse.json({ error: "Selected professional not found." }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: parsed.data,
        include: {
          user: { select: { name: true, email: true } },
          professional: { include: { user: { select: { name: true } } } },
          service: true,
          calendarSlot: true
        },
      });

      if (parsed.data.status === "CONFIRMED" && updatedBooking.calendarSlot) {
        await tx.calendarSlot.update({
          where: { id: updatedBooking.calendarSlot.id },
          data: { slotType: "BOOKED" }
        });
      } else if ((parsed.data.status === "CANCELLED" || parsed.data.status === "DISPUTED") && updatedBooking.calendarSlot) {
        await tx.calendarSlot.update({
          where: { id: updatedBooking.calendarSlot.id },
          data: { slotType: "AVAILABLE", bookingId: null }
        });
      }

      return updatedBooking;
    });

    return NextResponse.json({ booking: updated }, { status: 200 });

  } catch (err) {
    console.error("PATCH /api/admin/bookings/[id] error:", err);
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }
}
