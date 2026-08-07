import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { addressSchema } from "@/lib/validations";
import { getUserAddresses, createAddress } from "@/services/address.service";
import { z } from "zod";

// ── GET /api/customers/me/addresses ───────────────────────────────────────────
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const addresses = await getUserAddresses(session.user.id);
    return NextResponse.json({ addresses }, { status: 200 });
  } catch (err) {
    console.error("GET /customers/me/addresses error:", err);
    return NextResponse.json(
      { error: "Failed to load addresses." },
      { status: 500 }
    );
  }
}

// ── POST /api/customers/me/addresses ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  // Rate Limiting
  const rateLimit = checkRateLimit(`addresses:create:${session.user.id}`, {
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

  const schemaWithDefault = addressSchema.extend({
    isDefault: z.boolean().optional(),
  });

  const parsed = schemaWithDefault.safeParse(body);
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
    const address = await createAddress(session.user.id, parsed.data);
    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    console.error("POST /customers/me/addresses error:", err);
    return NextResponse.json(
      { error: "Failed to create address." },
      { status: 500 }
    );
  }
}
