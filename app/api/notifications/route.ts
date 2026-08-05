import { NextRequest, NextResponse } from "next/server";
import { getUserNotifications } from "@/services/notification.service";
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
