import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

const RATE_LIMITED_AUTH_PATHS = [
  "/api/auth/callback/credentials", // NextAuth's login endpoint
  "/api/auth/register",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limit the public, unauthenticated auth endpoints. These run before
  // the role/session checks below because they must stay reachable by
  // logged-out users.
  if (RATE_LIMITED_AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    const ip = getClientIp(req);
    const result = checkRateLimit(`auth:${ip}:${pathname}`, { limit: 10, windowMs: 60_000 });
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a minute." },
        { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
      );
    }
    return NextResponse.next();
  }

  // Everything else matched below (/dashboard, /professional, /admin)
  // requires a valid session, with role-specific redirects on top.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/professional") && token.role !== "PROFESSIONAL") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/professional/:path*",
    "/admin/:path*",
    "/api/auth/callback/credentials",
    "/api/auth/register",
  ],
};
