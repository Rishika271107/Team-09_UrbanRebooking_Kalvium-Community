import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock next-auth requireSession helper
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn().mockResolvedValue({
    session: { user: { id: "user-123", name: "Test User", email: "test@example.com", role: "CUSTOMER" } },
    error: null,
  }),
}));

// Mock prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    address: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    professional: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    passwordReset: {
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prismaMock)),
  },
}));

// Mock logger to avoid flooding output
vi.mock("@/lib/logger", () => ({
  logAuthSignIn: vi.fn(),
  logAuthSignUp: vi.fn(),
  logAuthSignOut: vi.fn(),
  logAuthFailure: vi.fn(),
  logBookingCreated: vi.fn(),
  logRebookCreated: vi.fn(),
  logReviewSubmitted: vi.fn(),
  logPaymentOrderCreated: vi.fn(),
  logPaymentVerified: vi.fn(),
  logPaymentFailure: vi.fn(),
  logNotificationCreated: vi.fn(),
  logNotificationRead: vi.fn(),
  logValidationError: vi.fn(),
  logDbError: vi.fn(),
  logUnexpectedError: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
const prismaMock = prisma as any;

describe("Backend APIs Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dummy Test for Mock setup verification", () => {
    it("verify mocks", () => {
      expect(prisma.user).toBeDefined();
    });
  });
});
