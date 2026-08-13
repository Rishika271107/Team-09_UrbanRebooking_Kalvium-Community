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
    const search = searchParams.get("search") || "";

    const whereClause: any = { role: "CUSTOMER" };
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    // Professionals only see customers who have booked them
    if (session.user.role === "PROFESSIONAL") {
      const pro = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      });
      if (pro) {
        whereClause.bookings = {
          some: {
            professionalId: pro.id
          }
        };
      } else {
        return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
      }
    }

    const customers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
