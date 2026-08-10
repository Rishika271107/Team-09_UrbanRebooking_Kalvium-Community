import { NextRequest, NextResponse } from "next/server";
import { deleteNotification } from "@/services/notification.service";
import { requireSession } from "@/lib/session";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { id } = await context.params;
    const deletedNotification = await deleteNotification(id, session.user.id);
    
    if (!deletedNotification) {
      return NextResponse.json({ error: "Notification not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Delete notification error:", err);
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 });
  }
}
