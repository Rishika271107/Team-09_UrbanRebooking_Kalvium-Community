"use server";

import { revalidatePath } from "next/cache";
import { createReview } from "@/services/review.service";
import { auth } from "@/auth";

export async function submitReviewAction(data: { professionalId: string; bookingId: string; rating: number; reviewText?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await createReview(session.user.id, data);
    revalidatePath("/dashboard");
    revalidatePath("/bookings");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
