import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    let professionalId = null;
    if (session.user.role === "PROFESSIONAL") {
      const pro = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      });
      if (pro) {
        professionalId = pro.id;
      } else {
        return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
      }
    } else {
      // If admin, they might want to view a specific pro's calendar
      professionalId = searchParams.get("professionalId");
    }

    const whereClause: any = {
      startTime: {
        gte: new Date(start)
      },
      endTime: {
        lte: new Date(end)
      }
    };

    if (professionalId) {
      whereClause.professionalId = professionalId;
    }

    const slots = await prisma.calendarSlot.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            user: { select: { name: true } },
            service: { select: { name: true } }
          }
        },
        professional: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { startTime: "asc" }
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json({ error: "Failed to fetch calendar slots" }, { status: 500 });
  }
}
