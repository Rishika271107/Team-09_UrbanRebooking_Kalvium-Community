import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Mock next-auth requireSession helper
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(),
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
    $transaction: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logValidationError: vi.fn(),
  logPaymentOrderCreated: vi.fn(),
  logPaymentVerified: vi.fn(),
  logPaymentFailure: vi.fn(),
  logUnexpectedError: vi.fn(),
}));

// Import endpoints
import { GET as getAddresses, POST as createAddress } from "@/app/api/customers/me/addresses/route";
import { PATCH as updateAddressRoute, DELETE as deleteAddressRoute } from "@/app/api/customers/me/addresses/[id]/route";

const prismaMock = prisma as any;
const requireSessionMock = requireSession as any;

describe("Addresses API Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/customers/me/addresses", () => {
    it("should return 401 if user is unauthorized", async () => {
      requireSessionMock.mockResolvedValueOnce({
        session: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      });

      const res = await getAddresses();
      expect(res.status).toBe(401);
    });

    it("should return addresses for authenticated user", async () => {
      requireSessionMock.mockResolvedValueOnce({
        session: { user: { id: "user-1" } },
        error: null,
      });
      prismaMock.address.findMany.mockResolvedValueOnce([
        { id: "addr-1", addressLine: "Line 1", city: "Mumbai", isDefault: true },
      ]);

      const res = await getAddresses();
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.addresses).toHaveLength(1);
    });
  });

  describe("POST /api/customers/me/addresses", () => {
    it("should validate and create a new address", async () => {
      requireSessionMock.mockResolvedValueOnce({
        session: { user: { id: "user-1" } },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/customers/me/addresses", {
        method: "POST",
        body: JSON.stringify({
          addressLine: "Baker Street 221B",
          city: "London",
          state: "London",
          pincode: "NW16XE",
          isDefault: true,
        }),
      });

      prismaMock.address.count.mockResolvedValueOnce(0);
      prismaMock.address.updateMany.mockResolvedValueOnce({ count: 0 });
      prismaMock.address.create.mockResolvedValueOnce({
        id: "addr-new",
        addressLine: "Baker Street 221B",
        city: "London",
        isDefault: true,
      });

      const res = await createAddress(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.address.id).toBe("addr-new");
    });
  });

  describe("PATCH /api/customers/me/addresses/[id]", () => {
    it("should modify address settings successfully", async () => {
      requireSessionMock.mockResolvedValueOnce({
        session: { user: { id: "user-1" } },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/customers/me/addresses/addr-1", {
        method: "PATCH",
        body: JSON.stringify({
          city: "New London",
        }),
      });

      prismaMock.address.findFirst.mockResolvedValueOnce({
        id: "addr-1",
        userId: "user-1",
        addressLine: "Baker Street 221B",
        city: "London",
        state: "London",
        pincode: "NW16XE",
        isDefault: false,
      });

      prismaMock.address.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.address.findUnique.mockResolvedValueOnce({
        id: "addr-1",
        city: "New London",
      });

      const res = await updateAddressRoute(req, { params: Promise.resolve({ id: "addr-1" }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.address.city).toBe("New London");
    });
  });

  describe("DELETE /api/customers/me/addresses/[id]", () => {
    it("should remove address record", async () => {
      requireSessionMock.mockResolvedValueOnce({
        session: { user: { id: "user-1" } },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/customers/me/addresses/addr-1", {
        method: "DELETE",
      });

      prismaMock.address.findFirst.mockResolvedValueOnce({
        id: "addr-1",
        userId: "user-1",
      });
      prismaMock.address.deleteMany.mockResolvedValueOnce({ count: 1 });

      const res = await deleteAddressRoute(req, { params: Promise.resolve({ id: "addr-1" }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
