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
    select: {
      role: true,
      vendorProfile: { select: { id: true } },
      eventPlannerProfile: { select: { id: true } },
    },
  });

  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase() || dbUser?.role || "USER";

  return {
    id: user.id,
    role,
    vendorProfileId: dbUser?.vendorProfile?.id || null,
    eventPlannerProfileId: dbUser?.eventPlannerProfile?.id || null,
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let where: Prisma.EventWhereInput = {};
    switch (session.role) {
      case "ADMIN":
        break;
      case "VENDOR": {
        const filters: Prisma.EventWhereInput[] = [{ venue: { ownerId: session.id } }];
        if (session.vendorProfileId) {
          filters.push({ venue: { vendorId: session.vendorProfileId } });
        }
        where = { OR: filters };
        break;
      }
      case "VENUE":
        where = { venue: { ownerId: session.id } };
        break;
      case "EVENT_PLANNER":
        where = session.eventPlannerProfileId
          ? { eventPlannerId: session.eventPlannerProfileId }
          : { organizerId: session.id };
        break;
      default:
        where = { organizerId: session.id };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            vendorId: true,
            ownerId: true,
          },
        },
        organizer: { select: { id: true, name: true, email: true } },
        eventPlanner: {
          select: {
            id: true,
            companyName: true,
            phone: true,
            user: { select: { id: true } },
          },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch events";
    console.error("GET /api/events", message);
    return NextResponse.json({ error: "Failed to fetch events", detail: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    const status = body?.status as string | undefined;

    if (!id)
      return NextResponse.json({ error: "Event id is required" }, { status: 400 });

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const isOwner = existing.organizerId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isAdmin)
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const data: Prisma.EventUpdateInput = {};
    if (status) data.status = status as any;
    if (body.title) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.date) data.date = new Date(body.date);
    if (body.budget !== undefined) data.budget = body.budget;

    const updated = await prisma.event.update({
      where: { id },
      data,
      include: {
        venue: { select: { id: true, name: true, location: true } },
        organizer: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/events", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
