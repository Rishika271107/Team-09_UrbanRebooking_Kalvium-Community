/**
 * Simple server-side logger.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (meta) {
    console[level === "debug" ? "log" : level](`${prefix} ${message}`, meta);
  } else {
    console[level === "debug" ? "log" : level](`${prefix} ${message}`);
  }
}

// ── Auth Events ──────────────────────────────────────────────────────────────

export function logAuthSignIn(userId: string, email: string) {
  log("info", { event: "auth.sign_in", userId, email });
}

export function logAuthSignUp(userId: string, email: string) {
  log("info", { event: "auth.sign_up", userId, email });
}

export function logAuthSignOut(userId: string) {
  log("info", { event: "auth.sign_out", userId });
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

// ── Payment Events ────────────────────────────────────────────────────────────

export function logPaymentOrderCreated(userId: string, bookingId: string, orderId: string, amount: number) {
  log("info", { event: "payment.order_created", userId, bookingId, orderId, amount });
}

export function logPaymentVerified(userId: string, bookingId: string, paymentId: string, orderId: string) {
  log("info", { event: "payment.verified", userId, bookingId, paymentId, orderId });
}

export function logPaymentFailure(userId: string, bookingId: string, orderId: string, reason: string) {
  log("warn", { event: "payment.failed", userId, bookingId, orderId, reason });
}

// ── Notification Events ───────────────────────────────────────────────────────

export function logNotificationCreated(userId: string, notificationId: string, title: string) {
  log("info", { event: "notification.created", userId, notificationId, title });
}

export function logNotificationRead(userId: string, notificationId: string) {
  log("info", { event: "notification.read", userId, notificationId });
}

// ── Database & Validation Events ──────────────────────────────────────────────

export function logValidationError(context: string, errors: unknown) {
  log("warn", { event: "validation.error", context, errors });
}

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

