import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";

async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role =
    (user.user_metadata?.role as string | undefined)?.toUpperCase() ||
    dbUser?.role ||
    "USER";

  if (role !== "ADMIN") return null;
  return { id: user.id, role };
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const body = await req.json();
  const title = (body?.title as string)?.trim();
  const message = (body?.message as string)?.trim();
  const audience = (body?.audience as string) || "All";

  if (!title || !message)
    return NextResponse.json(
      { error: "Title and message are required" },
      { status: 400 }
    );

  const roleFilter: Record<string, Role | undefined> = {
    Vendors: "VENDOR",
    Venues: "VENUE",
    Planners: "EVENT_PLANNER",
    Admins: "ADMIN",
  };

  try {
    const targetRole = roleFilter[audience];
    const where = targetRole ? { role: targetRole } : {};

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ sent: 0, message: "No matching users found" });
    }

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: `📢 ${title}: ${message}`,
        category: "announcement",
        read: false,
      })),
    });

    return NextResponse.json({ sent: users.length, audience });
  } catch (error) {
    console.error("POST /api/announcements", error);
    return NextResponse.json(
      { error: "Failed to send announcement" },
      { status: 500 }
    );
  }
}
