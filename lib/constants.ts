/**
 * Shared application constants.
 * Keep all magic strings and static config values here.
 */

// ── Booking Status ────────────────────────────────────────────────────────────
export const BOOKING_STATUS = {
  UPCOMING: "UPCOMING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUS;

// ── Payment Methods ───────────────────────────────────────────────────────────
export const PAYMENT_METHOD = {
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  UPI: "UPI",
  CASH: "CASH",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHOD;

// ── Notification ──────────────────────────────────────────────────────────────
export const NOTIFICATION_DEFAULTS = {
  MAX_UNREAD_BADGE: 99,
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  QUICK_REBOOK_LIMIT: 4,
  SEARCH_RESULT_LIMIT: 5,
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const ANALYTICS = {
  TOP_SERVICES_LIMIT: 5,
  CHART_COLORS: {
    TEAL: "#0d9488",
    SKY: "#0ea5e9",
    VIOLET: "#8b5cf6",
    AMBER: "#f59e0b",
    EMERALD: "#10b981",
    ROSE: "#f43f5e",
    SLATE: "#94a3b8",
    BLUE: "#3b82f6",
  },
} as const;

// ── Routes ────────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  ANALYTICS: "/dashboard/analytics",
  NOTIFICATIONS: "/dashboard/notifications",
  PROFILE: "/dashboard/profile",
  BOOKINGS: "/bookings",
} as const;
