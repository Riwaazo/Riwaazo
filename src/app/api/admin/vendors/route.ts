import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { Prisma } from "@prisma/client";

type AdminSession = {
  id: string;
  role: string;
};

async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase() || dbUser?.role || "USER";
  if (role !== "ADMIN") return null;
  return { id: user.id, role };
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: "APPROVED" | "REJECTED" };
    if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

    const updated = await prisma.vendorProfile.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (updated.userId) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: status === "APPROVED" ? "Your vendor profile was approved" : "Your vendor profile was rejected",
          category: "ADMIN_ACTION",
        },
      });
    }

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update vendor status";
    console.error("PATCH /api/admin/vendors", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
