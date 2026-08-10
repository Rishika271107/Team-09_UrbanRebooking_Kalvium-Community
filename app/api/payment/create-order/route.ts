import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import Razorpay from "razorpay";
import { z } from "zod";
import { logValidationError, logPaymentOrderCreated, logUnexpectedError } from "@/lib/logger";

const createOrderSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required."),
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  // Rate Limiting
  const rateLimit = checkRateLimit(`payment:order:${session.user.id}`, {
    limit: 15,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      logValidationError("payment:create-order", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { bookingId } = parsed.data;

    // Verify booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== "PENDING" && booking.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft or pending bookings can be paid for." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(booking.service.price * 100);

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_booking_${booking.id}`,
    });

    // Create a pending payment history record in the database
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.service.price,
        status: "PENDING",
        orderId: order.id,
      },
    });

    logPaymentOrderCreated(session.user.id, booking.id, order.id, booking.service.price);

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_id",
      },
      { status: 200 }
    );

  } catch (err: any) {
    logUnexpectedError("payment:create-order", err);
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 }
    );
  }
}
