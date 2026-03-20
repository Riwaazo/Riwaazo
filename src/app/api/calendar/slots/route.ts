import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { Prisma } from "@prisma/client";

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

  if (!(prisma as any).calendarSlot) {
    return NextResponse.json([]);
  }

  try {
    const slots = await prisma.calendarSlot.findMany({
      where: { userId: session.id },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error("GET /api/calendar/slots", error);
    return NextResponse.json({ error: "Failed to fetch calendar slots" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(prisma as any).calendarSlot) {
    return NextResponse.json({ error: "CalendarSlot model not configured" }, { status: 501 });
  }

  try {
    const body = await request.json();
    const name = (body?.name as string | undefined)?.trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const data: Prisma.CalendarSlotCreateInput = {
      name,
      date: body?.date ? new Date(body.date) : new Date(),
      location: body?.location || null,
      type: body?.type || "Custom",
      user: { connect: { id: session.id } },
    };

    const slot = await prisma.calendarSlot.create({ data });
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("POST /api/calendar/slots", error);
    return NextResponse.json({ error: "Failed to create calendar slot" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(prisma as any).calendarSlot) {
    return NextResponse.json({ error: "CalendarSlot model not configured" }, { status: 501 });
  }

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Slot id is required" }, { status: 400 });

    const existing = await prisma.calendarSlot.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

    const data: Prisma.CalendarSlotUpdateInput = {};
    if (body.name) data.name = body.name;
    if (body.date) data.date = new Date(body.date);
    if (body.location !== undefined) data.location = body.location;
    if (body.type) data.type = body.type;

    const slot = await prisma.calendarSlot.update({ where: { id }, data });
    return NextResponse.json(slot);
  } catch (error) {
    console.error("PATCH /api/calendar/slots", error);
    return NextResponse.json({ error: "Failed to update calendar slot" }, { status: 500 });
  }
}
