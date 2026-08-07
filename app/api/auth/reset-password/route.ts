import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1, "Token is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  // Global rate limit for reset attempts to prevent brute-forcing tokens
  const rateLimit = checkRateLimit("auth:reset-password:global", {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token: rawToken, password } = parsed.data;

    // Hash the raw token to match what is stored in the database
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 1. Transactionally find the reset request, check expiry, and update user password
    const result = await prisma.$transaction(async (tx) => {
      const resetRecord = await tx.passwordReset.findUnique({
        where: { token: hashedToken },
      });

      if (!resetRecord) {
        return { success: false, error: "Invalid or expired token.", status: 400 };
      }

      if (resetRecord.expiresAt < new Date()) {
        await tx.passwordReset.delete({ where: { id: resetRecord.id } });
        return { success: false, error: "Token has expired.", status: 400 };
      }

      const user = await tx.user.findUnique({
        where: { email: resetRecord.email },
      });

      if (!user) {
        await tx.passwordReset.delete({ where: { id: resetRecord.id } });
        return { success: false, error: "User not found.", status: 404 };
      }

      // Hash the new password using bcrypt
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Update password
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Delete the reset token to prevent reuse / replay attacks
      await tx.passwordReset.delete({ where: { id: resetRecord.id } });

      return { success: true };
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      { message: "Your password has been successfully reset." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
