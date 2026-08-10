import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { createReview } from "@/services/review.service";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const review = await createReview({
      userId: session.user.id,
      ...parsed.data,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    console.error("Create review error:", err);
    if (err?.message?.includes("already")) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}