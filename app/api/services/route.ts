import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { category: 'asc' },
    });
    
    return NextResponse.json({ services }, { status: 200 });
  } catch (err) {
    console.error("Fetch services error:", err);
    return NextResponse.json({ error: "Failed to fetch services." }, { status: 500 });
  }
}
