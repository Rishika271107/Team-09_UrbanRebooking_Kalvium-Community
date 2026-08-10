import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = z.object({ email: z.string().email() }).safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Rate Limiting (Prevent abuse / email flooding)
    const rateLimit = checkRateLimit(`auth:forgot-password:${email}`, {
      limit: 3,
      windowMs: 15 * 60_000, // max 3 attempts per email every 15 minutes
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // 1. Generate secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      
      // 2. Hash token to prevent database leak compromise
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      
      // 3. Set expiry to 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // 4. Save to DB (clean up any previous resets for this email atomically)
      // await prisma.$transaction([
      //   prisma.passwordReset.deleteMany({ where: { email } }),
      //   prisma.passwordReset.create({
      //     data: {
      //       email,
      //       token: hashedToken,
      //       expiresAt,
      //     },
      //   }),
      // ]);

      // 5. Send secure email
      await sendPasswordResetEmail(email, rawToken);
    }

    // Always return 200 to prevent user/email enumeration
    return NextResponse.json(
      { message: "If an account with that email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}