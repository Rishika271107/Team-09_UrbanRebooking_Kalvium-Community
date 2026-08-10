import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!professional) return NextResponse.json({ error: "Professional profile not found." }, { status: 404 });
    return NextResponse.json({ professional }, { status: 200 });
  } catch (err) {
    console.error("Professional me error:", err);
    return NextResponse.json({ error: "Failed to fetch professional profile." }, { status: 500 });
  }
}