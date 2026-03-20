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
    const messages = await prisma.message.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch messages";
    console.error("GET /api/messages", message);
    return NextResponse.json({ error: "Failed to fetch messages", detail: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const fromName = (body?.fromName as string | undefined)?.trim();
    const subject = (body?.subject as string | undefined)?.trim();
    if (!fromName || !subject) {
      return NextResponse.json({ error: "fromName and subject are required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        fromName,
        subject,
        preview: body?.preview || null,
        body: body?.body || null,
        user: { connect: { id: session.id } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create message";
    console.error("POST /api/messages", message);
    return NextResponse.json({ error: "Failed to create message", detail: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Message id is required" }, { status: 400 });

    const existing = await prisma.message.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    const message = await prisma.message.update({
      where: { id },
      data: {
        read: body?.read ?? existing.read,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update message";
    console.error("PATCH /api/messages", message);
    return NextResponse.json({ error: "Failed to update message", detail: message }, { status: 500 });
  }
}
