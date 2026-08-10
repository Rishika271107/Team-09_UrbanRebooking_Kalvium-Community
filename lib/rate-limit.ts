/**
 * Simple in-memory rate limiter.
 * Tracks request counts per IP within a sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(ip: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, resetAt, retryAfterSeconds: Math.ceil(options.windowMs / 1000) };
  }

  entry.count += 1;
  const allowed = entry.count <= options.limit;
  const remaining = Math.max(0, options.limit - entry.count);
  return { allowed, remaining, resetAt: entry.resetAt, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}
