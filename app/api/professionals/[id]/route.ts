import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing professional ID." }, { status: 400 });
    }

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            rating: true,
            reviewText: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        calendarSlots: {
          where: {
            slotType: "AVAILABLE",
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: { startTime: "asc" },
          select: {
            startTime: true,
            endTime: true,
          },
          take: 20, // Limit future slots returned to keep request lightweight
        },
      },
    });

    if (!professional || !professional.active) {
      return NextResponse.json({ error: "Professional not found." }, { status: 404 });
    }

    // Calculate experience based on when they joined (createdAt)
    const joinedDate = new Date(professional.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let experienceString = "New Professional";
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      experienceString = `${years} year${years > 1 ? "s" : ""} experience`;
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      experienceString = `${months} month${months > 1 ? "s" : ""} experience`;
    } else {
      experienceString = `${diffDays} day${diffDays > 1 ? "s" : ""} experience`;
    }

    // Format output mapping, excluding sensitive attributes
    const formattedProfessional = {
      name: professional.user.name,
      rating: professional.rating,
      skills: professional.skills,
      completedJobs: professional.jobsCompleted,
      experience: experienceString,
      reviews: professional.reviews.map((rev) => ({
        reviewerName: rev.user.name,
        rating: rev.rating,
        reviewText: rev.reviewText,
        createdAt: rev.createdAt,
      })),
      upcomingAvailability: professional.calendarSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    };

    return NextResponse.json({ professional: formattedProfessional }, { status: 200 });

  } catch (err: any) {
    console.error("GET /api/professionals/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch professional details." },
      { status: 500 }
    );
  }
}
