import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { availabilityQuerySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const parsed = availabilityQuerySchema.safeParse({ date: searchParams.get("date") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const professional = await prisma.professional.findUnique({ where: { userId: session.user.id } });
    if (!professional) return NextResponse.json({ error: "Professional not found." }, { status: 404 });

    const date = new Date(parsed.data.date);
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const slots = await prisma.calendarSlot.findMany({
      where: { professionalId: professional.id, startTime: { gte: start, lte: end } },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json({ slots }, { status: 200 });
  } catch (err) {
    console.error("Professional slots error:", err);
    return NextResponse.json({ error: "Failed to fetch slots." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const professional = await prisma.professional.findUnique({ where: { userId: session.user.id } });
    if (!professional) return NextResponse.json({ error: "Professional not found." }, { status: 404 });

    const { startTime, endTime, slotType } = await req.json();
    const slot = await prisma.calendarSlot.create({
      data: { professionalId: professional.id, startTime: new Date(startTime), endTime: new Date(endTime), slotType: slotType ?? "AVAILABLE" },
    });
    return NextResponse.json({ slot }, { status: 201 });
  } catch (err) {
    console.error("Create slot error:", err);
    return NextResponse.json({ error: "Failed to create slot." }, { status: 500 });
  }
}