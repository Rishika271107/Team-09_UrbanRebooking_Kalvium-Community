import type { NextRequest } from "next/server";

/**
 * Best-effort client IP for rate-limit bucketing. Trusts the standard
 * reverse-proxy headers (set by Vercel and most hosts); falls back to a
 * constant so requests without any forwarded header still share one bucket
 * instead of throwing.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
