import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Customers me error:", err);
    return NextResponse.json({ error: "Failed to fetch user." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, phone, address } = body;
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}