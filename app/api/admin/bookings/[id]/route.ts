import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { z } from "zod";

const patchBookingSchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "DISPUTED"]),
  professionalId: z.string().optional(),
});

async function ensureAdmin() {
  const { session, error } = await requireSession();
  if (error) return { error };
  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 }),
    };
  }
  return { session };
}

// ── PATCH /api/admin/bookings/[id] (Force updates on booking status or assignments) ───────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await ensureAdmin();
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

    // If professionalId is changing, ensure they exist first
    if (parsed.data.professionalId) {
      const professionalExists = await prisma.professional.findUnique({
        where: { id: parsed.data.professionalId },
      });
      if (!professionalExists) {
        return NextResponse.json({ error: "Selected professional not found." }, { status: 400 });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { name: true, email: true } },
        professional: { include: { user: { select: { name: true } } } },
        service: true,
      },
    });

    return NextResponse.json({ booking: updated }, { status: 200 });

  } catch (err) {
    console.error("PATCH /api/admin/bookings/[id] error:", err);
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }
}
