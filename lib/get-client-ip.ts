import { NextRequest } from "next/server";

/**
 * Extract the client IP from request headers, supporting common proxy headers.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}
