import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email }] : []),
      ],
    },
    select: { id: true, role: true },
  });

  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase() || dbUser?.role || "USER";
  if (role !== "ADMIN") return null;
  return { id: dbUser?.id || user.id, role };
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: "APPROVED" | "REJECTED" };
    if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

    const updated = await prisma.venue.update({
      where: { id },
      data: { status },
      include: {
        vendor: { select: { user: { select: { id: true } }, userId: true, companyName: true } },
        owner: { select: { id: true, email: true, name: true } },
      },
    });

    const notifyUserId = updated.ownerId || updated.vendor?.user?.id;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: status === "APPROVED" ? "Your venue was approved" : "Your venue was rejected",
          category: "ADMIN_ACTION",
        },
      });
    }

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update venue status";
    console.error("PATCH /api/admin/venues", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
