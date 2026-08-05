import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const whereClause: any = {
      AND: []
    };

    if (q) {
      whereClause.AND.push({
        OR: [
          { name: { contains: q } },
          { category: { contains: q } }
        ]
      });
    }

    if (category) {
      whereClause.AND.push({ category: { equals: category } });
    }

    if (minPrice) {
      whereClause.AND.push({ price: { gte: parseFloat(minPrice) } });
    }

    if (maxPrice) {
      whereClause.AND.push({ price: { lte: parseFloat(maxPrice) } });
    }

    // If no conditions were added, we can just remove the AND clause or leave it empty
    if (whereClause.AND.length === 0) {
      delete whereClause.AND;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (err) {
    console.error("Search services error:", err);
    return NextResponse.json({ error: "Failed to search services." }, { status: 500 });
  }
}
