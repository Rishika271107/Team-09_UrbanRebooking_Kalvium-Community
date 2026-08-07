import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { addressSchema } from "@/lib/validations";
import { updateAddress, deleteAddress } from "@/services/address.service";
import { z } from "zod";

// ── PATCH /api/customers/me/addresses/[id] ────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing address ID." }, { status: 400 });
  }

  // Rate Limiting
  const rateLimit = checkRateLimit(`addresses:update:${session.user.id}:${id}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Allow partial updates on PATCH
  const partialSchema = addressSchema.extend({
    isDefault: z.boolean().optional(),
  }).partial();

  const parsed = partialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    // Check if address exists and belongs to the user first.
    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 });
    }

    // Merge existing address with patch data for the service.
    // AddressInput interface in address.service requires addressLine, city, state, pincode.
    const updatePayload = {
      addressLine: parsed.data.addressLine ?? address.addressLine,
      city: parsed.data.city ?? address.city,
      state: parsed.data.state ?? address.state,
      pincode: parsed.data.pincode ?? address.pincode,
      isDefault: parsed.data.isDefault ?? address.isDefault,
    };

    const updated = await updateAddress(id, session.user.id, updatePayload);
    return NextResponse.json({ address: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /customers/me/addresses/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update address." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/customers/me/addresses/[id] ───────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing address ID." }, { status: 400 });
  }

  try {
    // Check if address exists and belongs to the user first.
    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 });
    }

    await deleteAddress(id, session.user.id);
    return NextResponse.json({ success: true, message: "Address deleted successfully." }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /customers/me/addresses/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete address." },
      { status: 500 }
    );
  }
}
