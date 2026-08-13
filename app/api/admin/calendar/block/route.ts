import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    }

    const body = await req.json();
    const { startTime, endTime, reason } = body;

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Start and end times are required" }, { status: 400 });
    }

    // If admin, they must provide professionalId
    if (!professionalId) {
      professionalId = body.professionalId;
      if (!professionalId) {
         return NextResponse.json({ error: "professionalId is required for admins" }, { status: 400 });
      }
    }

    // Check if slot already exists
    const existing = await prisma.calendarSlot.findFirst({
      where: {
        professionalId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }
    });

    if (existing) {
      if (existing.bookingId) {
         return NextResponse.json({ error: "Slot is already booked." }, { status: 400 });
      }
      // Update existing slot to blocked
      const updated = await prisma.calendarSlot.update({
        where: { id: existing.id },
        data: { slotType: "BLOCKED" }
      });
      return NextResponse.json({ slot: updated });
    }

    // Create new blocked slot
    const slot = await prisma.calendarSlot.create({
      data: {
        professionalId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        slotType: "BLOCKED"
      }
    });

    return NextResponse.json({ slot });
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
