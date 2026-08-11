import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { z } from "zod";

const newBookingSchema = z.object({
  serviceId: z.string().min(1, "serviceId is required."),
  address: z.string().min(5, "Please provide a valid address."),
  slotStart: z.string().min(1, "slotStart is required."),
  slotEnd: z.string().min(1, "slotEnd is required."),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = newBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { serviceId, address, slotStart, slotEnd } = parsed.data;
  const start = new Date(slotStart);
  const end = new Date(slotEnd);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return NextResponse.json(
      { error: "Invalid slot times provided." },
      { status: 400 }
    );
  }

  if (start < new Date()) {
    return NextResponse.json(
      { error: "Cannot book slots in the past." },
      { status: 400 }
    );
  }

  try {
    // Verify the service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    // Create the booking with PENDING status
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          serviceId,
          address,
          slotStart: start,
          slotEnd: end,
          status: "PENDING",
        },
        include: {
          service: true,
          professional: { include: { user: { select: { name: true } } } },
        },
      });

      // Create a notification for the user
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: "BOOKING",
          title: "Booking Request Received",
          message: `Your request for "${service.name}" on ${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} at ${start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} has been received and is pending confirmation.`,
        },
      });

      return newBooking;
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { error: "Failed to create the booking. Please try again." },
      { status: 500 }
    );
  }
}
