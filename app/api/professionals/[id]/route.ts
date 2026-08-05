import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const professional = await prisma.professional.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true }
        },
        calendarSlots: {
          where: { slotType: "AVAILABLE" },
          orderBy: { startTime: 'asc' },
          // Limit to near future for UI simplicity
          take: 50
        }
      }
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    // Mock reviews since there is no Review model in Prisma schema
    const mockReviews = [
      {
        id: "rev1",
        customerName: "Sarah M.",
        rating: 5,
        date: "2 days ago",
        text: "Exceptional service! Arrived exactly on time and was very professional."
      },
      {
        id: "rev2",
        customerName: "John D.",
        rating: 4,
        date: "1 week ago",
        text: "Great work, very detailed. Would definitely book again."
      },
      {
        id: "rev3",
        customerName: "Emily R.",
        rating: 5,
        date: "2 weeks ago",
        text: "Best experience I've had with Urban Company. Highly recommended!"
      }
    ];

    // Mock extra stats
    const stats = {
      experienceYears: Math.floor(Math.random() * 8) + 2,
      completedJobs: Math.floor(Math.random() * 400) + 50
    };

    return NextResponse.json({
      professional,
      reviews: mockReviews,
      stats
    }, { status: 200 });

  } catch (err) {
    console.error("Fetch professional error:", err);
    return NextResponse.json({ error: "Failed to fetch professional details" }, { status: 500 });
  }
}
