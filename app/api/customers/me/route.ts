import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateProfileSchema } from "@/lib/validations";

// ── GET /api/customers/me ─────────────────────────────────────────────────────
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profileImage: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            addressLine: true,
            city: true,
            state: true,
            pincode: true,
            isDefault: true,
          },
        },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Customers me error:", err);
    return NextResponse.json({ error: "Failed to fetch user." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, phone, address } = body;
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, phone: true, address: true },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

// ── PATCH /api/customers/me ───────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  // 1. Authentication — reject unauthenticated callers immediately.
  const { session, error } = await requireSession();
  if (error) return error;

  // 2. Rate limiting — 10 profile updates per user per minute.
  const rateLimit = checkRateLimit(`customers:me:patch:${session.user.id}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many update requests. Please try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  // 3. Parse body — guard against non-JSON payloads.
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 4. Validate with Zod.
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { name, phone, profileImage, defaultAddressId } = parsed.data;
  const userId = session.user.id;

  try {
    // 5. Authorisation check for defaultAddressId:
    //    Ensure the address actually belongs to this user before touching it,
    //    so a user can't hijack another user's address record.
    if (defaultAddressId !== undefined) {
      const address = await prisma.address.findUnique({
        where: { id: defaultAddressId },
        select: { userId: true },
      });

      if (!address) {
        return NextResponse.json(
          { error: "Address not found." },
          { status: 404 }
        );
      }

      if (address.userId !== userId) {
        return NextResponse.json(
          { error: "You are not authorized to use this address." },
          { status: 403 }
        );
      }
    }

    // 6. Prisma transaction — keeps user update and address default-swap atomic.
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 6a. Build the User update payload from whichever fields were supplied.
      const userDataToUpdate: {
        name?: string;
        phone?: string;
        profileImage?: string | null;
      } = {};

      if (name !== undefined) userDataToUpdate.name = name;
      if (phone !== undefined) userDataToUpdate.phone = phone;
      if (profileImage !== undefined) {
        // Allow callers to clear the image by sending an empty string.
        userDataToUpdate.profileImage = profileImage === "" ? null : profileImage;
      }

      // 6b. Update address default flag if requested.
      //     Step 1: clear the existing default for this user.
      //     Step 2: mark the requested address as default.
      //     Both are inside the same transaction so they succeed or fail together.
      if (defaultAddressId !== undefined) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
        await tx.address.update({
          where: { id: defaultAddressId },
          data: { isDefault: true },
        });
      }

      // 6c. Update the user row (only if there are user-level fields to change).
      //     We always re-fetch with the full select so the response is consistent
      //     regardless of whether the user payload was empty.
      const user = await tx.user.update({
        where: { id: userId },
        data: userDataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          profileImage: true,
          role: true,
          updatedAt: true,
          addresses: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              addressLine: true,
              city: true,
              state: true,
              pincode: true,
              isDefault: true,
            },
          },
        },
      });

      return user;
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    console.error("PATCH /customers/me error:", err);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
