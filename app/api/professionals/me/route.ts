import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  if (session.user.role !== "PROFESSIONAL") {
    return NextResponse.json(
      { error: "Only professional accounts can access this resource." },
      { status: 403 }
    );
  }

  try {
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "No professional profile found for this account." },
        { status: 404 }
      );
    }

    return NextResponse.json({ professional });
  } catch (err) {
    console.error("Fetch /professionals/me error:", err);
    return NextResponse.json({ error: "Failed to load your profile." }, { status: 500 });
  }
}
