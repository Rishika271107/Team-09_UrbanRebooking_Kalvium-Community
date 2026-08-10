import { NextRequest, NextResponse } from "next/server";
import { setDefaultPaymentMethod } from "@/services/payment.service";
import { requireSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { id } = await params;
    const updated = await setDefaultPaymentMethod(id, session.user.id);
    
    if (!updated) {
      return NextResponse.json({ error: "Payment method not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ success: true, paymentMethod: updated }, { status: 200 });
  } catch (err) {
    console.error("Set default payment method error:", err);
    return NextResponse.json({ error: "Failed to set default payment method." }, { status: 500 });
  }
}
