import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

const RATE_LIMITED_AUTH_PATHS = [
  "/api/auth/callback/credentials",
  "/api/auth/register",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Rate limiting
  if (
    RATE_LIMITED_AUTH_PATHS.some((path) =>
      pathname.startsWith(path)
    )
  ) {
    const ip = getClientIp(req);

    const result = checkRateLimit(
      `auth:${ip}:${pathname}`,
      {
        limit: 10,
        windowMs: 60_000,
      }
    );

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again in a minute.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfterSeconds),
          },
        }
      );
    }
  }

  // 2. Authentication
  const user = req.auth?.user;

  // 3. Role
  const role = (user as { role?: string } | undefined)?.role;

  if (
    pathname.startsWith("/professional") &&
    role !== "PROFESSIONAL"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  if (
    pathname.startsWith("/admin") &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/professional/:path*",
    "/admin/:path*",
    "/bookings/:path*",
    "/rebook/:path*",
    "/api/auth/callback/credentials",
    "/api/auth/register",
    "/forgot-password",
  ],
};
