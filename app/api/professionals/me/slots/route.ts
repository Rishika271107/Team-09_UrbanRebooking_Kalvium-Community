import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const toggleSlotSchema = z.object({
  startTime: z.string().min(1, "startTime is required."),
  endTime: z.string().min(1, "endTime is required."),
  slotType: z.enum(["AVAILABLE", "BLOCKED"]),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  if (session.user.role !== "PROFESSIONAL") {
    return NextResponse.json(
      { error: "Only professional accounts can manage a calendar." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = toggleSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const start = new Date(parsed.data.startTime);
  const end = new Date(parsed.data.endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return NextResponse.json({ error: "Invalid slot time range." }, { status: 400 });
  }

  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id },
    });
    if (!professional) {
      return NextResponse.json(
        { error: "No professional profile found for this account." },
        { status: 404 }
      );
    }

    const existing = await prisma.calendarSlot.findUnique({
      where: {
        professionalId_startTime: { professionalId: professional.id, startTime: start },
      },
    });

    // A professional can freely toggle AVAILABLE <-> BLOCKED, but can never
    // overwrite a slot that's already reserved by a confirmed booking.
    if (existing?.slotType === "BOOKED") {
      return NextResponse.json(
        { error: "This slot is already booked and can't be changed here." },
        { status: 409 }
      );
    }

    const slot = await prisma.calendarSlot.upsert({
      where: {
        professionalId_startTime: { professionalId: professional.id, startTime: start },
      },
      update: { slotType: parsed.data.slotType, endTime: end },
      create: {
        professionalId: professional.id,
        startTime: start,
        endTime: end,
        slotType: parsed.data.slotType,
      },
    });

    return NextResponse.json({ slot }, { status: 200 });
  } catch (err) {
    console.error("Toggle slot error:", err);
    return NextResponse.json({ error: "Failed to update the slot." }, { status: 500 });
  }
}
