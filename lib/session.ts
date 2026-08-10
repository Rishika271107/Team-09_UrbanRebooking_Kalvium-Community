import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Helper to require a valid session in API route handlers.
 * Returns `{ session }` on success or `{ error: NextResponse }` on failure.
 * Uses NextAuth v5 `auth()` instead of the deprecated v4 `getServerSession`.
 */
export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null as never,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null as never };
}
