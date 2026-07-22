import { type Session } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Resolves the current server-side session for use inside API route handlers.
 * Returns a 401 JSON response in `error` when there is no authenticated user,
 * so callers can just do:
 *
 *   const { session, error } = await requireSession();
 *   if (error) return error;
 */
export async function requireSession(): Promise<
  { session: Session; error: null } | { session: null; error: NextResponse }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 }),
    };
  }

  return { session, error: null };
}
