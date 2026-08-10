import { NextRequest, NextResponse } from "next/server";
import { deletePaymentMethod } from "@/services/payment.service";
import { requireSession } from "@/lib/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { id } = await params;
    const deleted = await deletePaymentMethod(id, session.user.id);
    
    if (!deleted) {
      return NextResponse.json({ error: "Payment method not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Delete payment method error:", err);
    return NextResponse.json({ error: "Failed to delete payment method." }, { status: 500 });
  }
}
