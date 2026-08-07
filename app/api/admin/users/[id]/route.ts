import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { z } from "zod";

const patchUserSchema = z.object({
  role: z.enum(["CUSTOMER", "PROFESSIONAL", "ADMIN"]).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

async function ensureAdmin() {
  const { session, error } = await requireSession();
  if (error) return { error };
  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 }),
    };
  }
  return { session };
}

// ── PATCH /api/admin/users/[id] (Update user details / role as admin) ───────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await ensureAdmin();
  if (error) return error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing user ID." }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated }, { status: 200 });

  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}
