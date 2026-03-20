import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user;
}

export async function GET() {
  try {
    const planners = await prisma.eventPlannerProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        events: { select: { id: true, title: true, date: true, status: true } },
      },
    });

    return NextResponse.json(planners);
  } catch (error) {
    console.error("GET /api/event-planners", error);
    return NextResponse.json({ error: "Failed to fetch event planners" }, { status: 500 });
  }
}

/** Create a new planner profile for the authenticated user */
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.eventPlannerProfile.findUnique({ where: { userId: user.id } });
  if (existing) return NextResponse.json({ error: "Profile already exists. Use PATCH to update." }, { status: 409 });

  const body = await req.json();
  const companyName = (body.companyName as string)?.trim();
  if (!companyName) return NextResponse.json({ error: "Company name is required" }, { status: 400 });

  try {
    // Ensure the User row exists (Supabase auth user may not have a Prisma User yet)
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ?? user.email!.split("@")[0],
        role: "EVENT_PLANNER",
      },
    });

    const profile = await prisma.eventPlannerProfile.create({
      data: {
        userId: user.id,
        companyName,
        phone: (body.phone as string)?.trim() || null,
        services: (body.services as string)?.trim() || null,
        description: (body.description as string)?.trim() || null,
        website: (body.website as string)?.trim() || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        events: { select: { id: true, title: true, date: true, status: true } },
      },
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("POST /api/event-planners", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

/** Update the authenticated user's planner profile */
export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.eventPlannerProfile.findUnique({ where: { userId: user.id } });
  if (!existing) return NextResponse.json({ error: "No profile found. Create one first." }, { status: 404 });

  const body = await req.json();
  const data: Record<string, string | null> = {};
  if (body.companyName !== undefined) data.companyName = (body.companyName as string)?.trim() || existing.companyName;
  if (body.phone !== undefined) data.phone = (body.phone as string)?.trim() || null;
  if (body.services !== undefined) data.services = (body.services as string)?.trim() || null;
  if (body.description !== undefined) data.description = (body.description as string)?.trim() || null;
  if (body.website !== undefined) data.website = (body.website as string)?.trim() || null;

  try {
    const updated = await prisma.eventPlannerProfile.update({
      where: { userId: user.id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        events: { select: { id: true, title: true, date: true, status: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/event-planners", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
