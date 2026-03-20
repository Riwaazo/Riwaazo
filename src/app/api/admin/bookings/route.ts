import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getAdminSession() {
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
    const { id, status } = body as { id?: string; status?: "CONFIRMED" | "CANCELLED" | "PENDING" };
    if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true } },
        vendor: { select: { user: { select: { id: true } } } },
        venue: { select: { ownerId: true } },
      },
    });

    const notifyIds = new Set<string>();
    if (updated.userId) notifyIds.add(updated.userId);
    if (updated.vendor?.user?.id) notifyIds.add(updated.vendor.user.id);
    if (updated.venue?.ownerId) notifyIds.add(updated.venue.ownerId);

    const title = status === "CONFIRMED" ? "Your booking was confirmed" : status === "CANCELLED" ? "Your booking was cancelled" : "Booking status updated";

    await Promise.all(
      Array.from(notifyIds).map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            title,
            category: "BOOKING",
          },
        })
      )
    );

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update booking status";
    console.error("PATCH /api/admin/bookings", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
