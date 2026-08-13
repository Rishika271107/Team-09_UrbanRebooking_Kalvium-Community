import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { z } from "zod";

async function ensureAdminOrPro() {
  const { session, error } = await requireSession();
  if (error) return { error };
  if (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL") {
    return {
      error: NextResponse.json({ error: "Access denied. Admins and Professionals only." }, { status: 403 }),
    };
  }
  return { session };
}

export async function GET(req: NextRequest) {
  const { session, error } = await ensureAdminOrPro();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || ""; // Search by customer email/name
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") === "asc" ? "asc" : "desc";

    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    // Add professional check if they are a PROFESSIONAL
    if (session.user.role === "PROFESSIONAL") {
      const pro = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      });
      if (pro) {
        where.professionalId = pro.id;
      }
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          professional: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          service: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("GET /api/admin/bookings error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}
