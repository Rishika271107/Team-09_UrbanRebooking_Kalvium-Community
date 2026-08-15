import { NextRequest, NextResponse } from "next/server";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notification.service";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const notifications = await getUserNotifications(session.user.id);
    return NextResponse.json({ notifications }, { status: 200 });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json().catch(() => ({}));

    if (body.all) {
      await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await markNotificationAsRead(body.id, session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Provide id or all:true" }, { status: 400 });
  } catch (err) {
    console.error("Update notifications error:", err);
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}
