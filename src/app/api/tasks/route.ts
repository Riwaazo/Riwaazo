import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Role, type Prisma } from "@prisma/client";

async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const mappedRole = (() => {
    const raw = (user.user_metadata?.role as string | undefined)?.toLowerCase();
    switch (raw) {
      case "vendor":
        return Role.VENDOR;
      case "venue-owner":
        return Role.VENUE;
      case "planner":
      case "event_planner":
      case "event-planner":
        return Role.EVENT_PLANNER;
      case "admin":
        return Role.ADMIN;
      default:
        return Role.USER;
    }
  })();

  const name = user.user_metadata?.full_name || user.email || "User";
  const email = user.email || `${user.id}@placeholder.local`;

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email, name, role: mappedRole },
    update: { role: mappedRole, name },
    select: {
      role: true,
      vendorProfile: { select: { id: true } },
      eventPlannerProfile: { select: { id: true } },
      name: true,
    },
  });

  return {
    id: user.id,
    role: dbUser.role,
    name: dbUser.name || name,
    vendorProfileId: dbUser.vendorProfile?.id || null,
    eventPlannerProfileId: dbUser.eventPlannerProfile?.id || null,
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: session.id },
      orderBy: [{ status: "asc" }, { due: "asc" }],
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = (body?.title as string | undefined)?.trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const data: Prisma.TaskCreateInput = {
      title,
      due: body?.due ? new Date(body.due) : null,
      priority: body?.priority || "MEDIUM",
      owner: body?.owner || session.name,
      user: { connect: { id: session.id } },
    };

    const task = await prisma.task.create({ data });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Task id is required" }, { status: 400 });

    const existing = await prisma.task.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const data: Prisma.TaskUpdateInput = {};
    if (body.title) data.title = body.title;
    if (body.priority) data.priority = body.priority;
    if (body.owner) data.owner = body.owner;
    if (body.status) data.status = body.status;
    if (body.due) data.due = new Date(body.due);

    const task = await prisma.task.update({ where: { id }, data });
    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
