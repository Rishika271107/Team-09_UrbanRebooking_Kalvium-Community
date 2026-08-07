import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";
import { z } from "zod";
import { logValidationError, logPaymentVerified, logPaymentFailure, logUnexpectedError } from "@/lib/logger";

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "razorpayOrderId is required."),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILED", "CANCELLED"]),
  errorMessage: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  // Rate Limiting
  const rateLimit = checkRateLimit(`payment:verify:${session.user.id}`, {
    limit: 15,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many payment verification attempts. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      logValidationError("payment:verify", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, status, errorMessage } = parsed.data;

    // Retrieve existing payment record
    const payment = await prisma.payment.findUnique({
      where: { orderId: razorpayOrderId },
      include: { booking: true },
    });

    if (!payment || payment.booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "This payment order has already been processed." },
        { status: 400 }
      );
    }

    // Process payment success with signature verification
    if (status === "SUCCESS") {
      if (!razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
          { error: "Missing verification parameters for successful status." },
          { status: 400 }
        );
      }

      // Verification Signature (secret key comes from env variable)
      const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        // Log mismatch and fail payment
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            errorMessage: "Signature verification failed.",
          },
        });
        logPaymentFailure(session.user.id, payment.bookingId, razorpayOrderId, "Signature verification failed.");
        return NextResponse.json({ error: "Payment signature mismatch." }, { status: 400 });
      }

      // Update Booking status to CONFIRMED and payment to SUCCESS atomically
      const updatedData = await prisma.$transaction(async (tx) => {
        const pay = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            paymentId: razorpayPaymentId,
            signature: razorpaySignature,
          },
        });

        const book = await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CONFIRMED",
          },
        });

        return { pay, book };
      });

      logPaymentVerified(session.user.id, payment.bookingId, razorpayPaymentId, razorpayOrderId);

      return NextResponse.json(
        { success: true, message: "Payment verified successfully.", payment: updatedData.pay },
        { status: 200 }
      );
    }

    // Process failed or cancelled payments
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status === "FAILED" ? "FAILED" : "CANCELLED",
        errorMessage: errorMessage || `${status} state returned by gateway.`,
      },
    });

    logPaymentFailure(
      session.user.id,
      payment.bookingId,
      razorpayOrderId,
      errorMessage || `Recorded state as ${status}`
    );

    return NextResponse.json(
      { success: false, message: `Payment recorded as ${status}.`, payment: updatedPayment },
      { status: 200 }
    );

  } catch (err) {
    logUnexpectedError("payment:verify", err);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}

