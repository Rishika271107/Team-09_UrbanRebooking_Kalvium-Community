import { NextRequest, NextResponse } from "next/server";
import { markNotificationAsRead } from "@/services/notification.service";
import { requireSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const updatedNotification = await markNotificationAsRead(params.id, session.user.id);
    
    if (!updatedNotification) {
      return NextResponse.json({ error: "Notification not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: updatedNotification }, { status: 200 });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    return NextResponse.json({ error: "Failed to mark notification as read." }, { status: 500 });
  }
}
