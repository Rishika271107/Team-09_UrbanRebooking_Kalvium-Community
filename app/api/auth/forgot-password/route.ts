import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    // Always return success to prevent email enumeration
    await prisma.user.findUnique({ where: { email } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}