import { NextRequest, NextResponse } from "next/server";
import { getUserPaymentMethods, addPaymentMethod } from "@/services/payment.service";
import { requireSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const paymentMethods = await getUserPaymentMethods(session.user.id);
    return NextResponse.json({ paymentMethods }, { status: 200 });
  } catch (err) {
    console.error("Fetch payment methods error:", err);
    return NextResponse.json({ error: "Failed to fetch payment methods." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const { cardType, lastFour, provider, isDefault } = body;

    if (!cardType || !lastFour || !provider) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const newMethod = await addPaymentMethod(session.user.id, { cardType, lastFour, provider, isDefault });
    return NextResponse.json({ success: true, paymentMethod: newMethod }, { status: 201 });
  } catch (err) {
    console.error("Add payment method error:", err);
    return NextResponse.json({ error: "Failed to add payment method." }, { status: 500 });
  }
}
