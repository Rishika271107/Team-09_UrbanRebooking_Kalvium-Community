import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PROFESSIONAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Professionals only see their own services or all services if that's how Urban Company works.
    // For now, let's just return all services.
    const services = await prisma.service.findMany({
      orderBy: { category: "asc" }
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
