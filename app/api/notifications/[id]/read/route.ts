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
    return NextResponse.json(
      { error: "Missing notification ID." },
      { status: 400 }
    );
  }

  const rateLimit = checkRateLimit(
    `notifications:read:${session.user.id}:${id}`,
    {
      limit: 30,
      windowMs: 60_000,
    }
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 403 }
      );
    }

    const updatedNotification = await markNotificationAsRead(
      id,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        notification: updatedNotification,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Mark notification as read error:", err);

    return NextResponse.json(
      {
        error: "Failed to mark notification as read.",
      },
      { status: 500 }
    );
  }
}
