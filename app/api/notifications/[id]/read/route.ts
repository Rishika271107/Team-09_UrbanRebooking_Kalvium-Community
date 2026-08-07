import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { markNotificationAsRead } from "@/services/notification.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing notification ID." }, { status: 400 });
  }

  // Rate Limiting (Prevent abuse / spamming read status updates)
  const rateLimit = checkRateLimit(`notifications:read:${session.user.id}:${id}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    // 1. Authorisation Check: Check if the notification exists and belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    // 2. Mark as read using service helper
    const updatedNotification = await markNotificationAsRead(id, session.user.id);
    return NextResponse.json({ notification: updatedNotification }, { status: 200 });

  } catch (err: any) {
    console.error("PATCH /api/notifications/[id]/read error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update notification status." },
      { status: 500 }
    );
  }
}
