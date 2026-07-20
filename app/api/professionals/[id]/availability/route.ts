import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { availabilityQuerySchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;
  const { searchParams } = new URL(req.url);

  const parsed = availabilityQuerySchema.safeParse({
    date: searchParams.get("date") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid 'date' query parameter (YYYY-MM-DD) is required." },
      { status: 400 }
    );
  }

  try {
    const professional = await prisma.professional.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found." }, { status: 404 });
    }

    const dayStart = new Date(`${parsed.data.date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const slots = await prisma.calendarSlot.findMany({
      where: {
        professionalId: id,
        startTime: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({
      professional: {
        id: professional.id,
        name: professional.user.name,
        active: professional.active,
      },
      date: parsed.data.date,
      slots,
    });
  } catch (err) {
    console.error("Fetch availability error:", err);
    return NextResponse.json({ error: "Failed to load availability." }, { status: 500 });
  }
}
