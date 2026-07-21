/**
 * Structured logger utility for production-grade logging.
 * Uses structured console output compatible with Vercel Log Drain.
 * NEVER logs passwords or sensitive fields.
 */

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  event: string;
  [key: string]: unknown;
}

function log(level: LogLevel, payload: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    ...payload,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ── Auth Events ──────────────────────────────────────────────────────────────

export function logAuthSignIn(userId: string, email: string) {
  log("info", { event: "auth.sign_in", userId, email });
}

export function logAuthSignUp(userId: string, email: string) {
  log("info", { event: "auth.sign_up", userId, email });
}

export function logAuthFailure(email: string, reason: string) {
  log("warn", { event: "auth.failure", email, reason });
}

// ── Booking Events ────────────────────────────────────────────────────────────

export function logBookingCreated(userId: string, bookingId: string, serviceId: string) {
  log("info", { event: "booking.created", userId, bookingId, serviceId });
}

export function logRebookCreated(userId: string, originalId: string, newId: string) {
  log("info", { event: "booking.rebooked", userId, originalId, newId });
}

export function logReviewSubmitted(userId: string, bookingId: string, rating: number) {
  log("info", { event: "review.submitted", userId, bookingId, rating });
}

// ── Database Events ───────────────────────────────────────────────────────────

export function logDbError(operation: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  log("error", { event: "db.error", operation, message });
}

// ── Generic ───────────────────────────────────────────────────────────────────

export function logUnexpectedError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  log("error", { event: "unexpected_error", context, message, stack });
}
