import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  });

  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase() || dbUser?.role || "USER";

  return {
    id: user.id,
    role,
    name: dbUser?.name || user.user_metadata?.full_name || user.email || "User",
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/notifications", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = (body?.title as string | undefined)?.trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const notification = await prisma.notification.create({
      data: {
        title,
        category: body?.category || null,
        read: body?.read ?? false,
        user: { connect: { id: session.id } },
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Notification id is required" }, { status: 400 });

    const existing = await prisma.notification.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: body?.read ?? existing.read },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("PATCH /api/notifications", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
