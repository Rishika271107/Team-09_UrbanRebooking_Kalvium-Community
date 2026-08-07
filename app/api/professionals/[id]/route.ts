import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing professional ID." },
        { status: 400 }
      );
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
          orderBy: {
            createdAt: "desc",
          },
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
          orderBy: {
            startTime: "asc",
          },
          take: 20,
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!professional || !professional.active) {
      return NextResponse.json(
        { error: "Professional not found." },
        { status: 404 }
      );
    }

    const joinedDate = new Date(professional.createdAt);
    const now = new Date();

    const diffDays = Math.floor(
      (now.getTime() - joinedDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let experience = "New Professional";

    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      experience = `${years} year${years > 1 ? "s" : ""} experience`;
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      experience = `${months} month${months > 1 ? "s" : ""} experience`;
    } else {
      experience = `${diffDays} day${diffDays !== 1 ? "s" : ""} experience`;
    }

    return NextResponse.json(
      {
        professional: {
          name: professional.user.name,
          rating: professional.rating,
          skills: professional.skills,
          completedJobs: professional.jobsCompleted,
          experience,
          reviews: professional.reviews.map((review) => ({
            reviewerName: review.user.name,
            rating: review.rating,
            reviewText: review.reviewText,
            createdAt: review.createdAt,
          })),
          upcomingAvailability: professional.calendarSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Fetch professional error:", err);

    return NextResponse.json(
      {
        error: "Failed to fetch professional details.",
      },
      {
        status: 500,
      }
    );
  }
}