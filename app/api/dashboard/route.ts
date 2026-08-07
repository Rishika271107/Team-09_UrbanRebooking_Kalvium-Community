import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const userId = session.user.id;

    // Fetch user's completed bookings to determine favorite professionals
    const userCompletedBookings = await prisma.booking.findMany({
      where: { userId, status: "COMPLETED" },
      select: { professionalId: true }
    });

    // Calculate favorite professionals
    const proCounts: Record<string, number> = {};
    for (const b of userCompletedBookings) {
      if (b.professionalId) {
        proCounts[b.professionalId] = (proCounts[b.professionalId] || 0) + 1;
      }
    }
    const topProIds = Object.entries(proCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0]);

    let favoriteProfessionals = [];
    if (topProIds.length > 0) {
      favoriteProfessionals = await prisma.professional.findMany({
        where: { id: { in: topProIds } },
        include: { user: { select: { name: true } }, _count: { select: { bookings: true } } }
      });
    }

    // Trending Services (Find services with most bookings globally, or just take first 4 if few bookings)
    // Prisma v5 groupBy does not support `orderBy: { _count: { _all } }` — use a raw count approach instead
    const bookingCounts = await prisma.booking.groupBy({
      by: ["serviceId"],
      _count: { serviceId: true },
    });

    // Sort by count descending in JS and take top 4
    const topBookingCounts = bookingCounts
      .sort((a, b) => b._count.serviceId - a._count.serviceId)
      .slice(0, 4);

    let trendingServiceIds = topBookingCounts.map(bc => bc.serviceId).filter(Boolean) as string[];
    let trendingServices = [];
    if (trendingServiceIds.length > 0) {
      trendingServices = await prisma.service.findMany({
        where: { id: { in: trendingServiceIds } }
      });
    } else {
      // Fallback to any 4 services if no bookings exist
      trendingServices = await prisma.service.findMany({ take: 4 });
    }

    // Categories
    const categories = await prisma.service.findMany({
      distinct: ["category"],
      select: { category: true }
    });
    
    // For "Recently Viewed" and "Cross-Sells" (Frequently Booked Together)
    // We use heuristics since we don't track views.
    const crossSells = await prisma.service.findMany({
      take: 3,
      orderBy: { price: 'asc' } // Lowest price items as add-ons
    });

    const recommendedServices = await prisma.service.findMany({
      take: 4,
      orderBy: { durationMinutes: 'desc' } // Just a heuristic
    });

    return NextResponse.json({
      favoriteProfessionals: favoriteProfessionals.map(pro => ({
        id: pro.id,
        name: pro.user.name,
        category: pro.skills,
        rating: pro.rating,
        completed: pro._count.bookings,
        active: pro.active
      })),
      trendingServices,
      categories: categories.map(c => c.category),
      crossSells,
      recommendedServices
    }, { status: 200 });

  } catch (err) {
    console.error("Fetch dashboard data error:", err);
    return NextResponse.json({ error: "Failed to load dashboard data." }, { status: 500 });
  }
}
