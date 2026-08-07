import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { z } from "zod";

const patchProfessionalSchema = z.object({
  active: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
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

// ── PATCH /api/admin/professionals/[id] (Modify professional activation status / details) ───────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await ensureAdmin();
  if (error) return error;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing professional ID." }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = patchProfessionalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const professional = await prisma.professional.findUnique({ where: { id } });
    if (!professional) {
      return NextResponse.json({ error: "Professional profile not found." }, { status: 404 });
    }

    const updated = await prisma.professional.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ professional: updated }, { status: 200 });

  } catch (err) {
    console.error("PATCH /api/admin/professionals/[id] error:", err);
    return NextResponse.json({ error: "Failed to update professional profile." }, { status: 500 });
  }
}
