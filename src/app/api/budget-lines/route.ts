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

  if (!(prisma as any).budgetLine) {
    return NextResponse.json([]);
  }

  try {
    const lines = await prisma.budgetLine.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(lines);
  } catch (error) {
    console.error("GET /api/budget-lines", error);
    return NextResponse.json({ error: "Failed to fetch budget lines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(prisma as any).budgetLine) {
    return NextResponse.json({ error: "BudgetLine model not configured" }, { status: 501 });
  }

  try {
    const body = await request.json();
    const category = (body?.category as string | undefined)?.trim();
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

    const data: Prisma.BudgetLineCreateInput = {
      category,
      allocated: Number(body?.allocated) || 0,
      spent: Number(body?.spent) || 0,
      status: body?.status || "Open",
      owner: body?.owner || session.name,
      user: { connect: { id: session.id } },
    };

    const line = await prisma.budgetLine.create({ data });
    return NextResponse.json(line, { status: 201 });
  } catch (error) {
    console.error("POST /api/budget-lines", error);
    return NextResponse.json({ error: "Failed to create budget line" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(prisma as any).budgetLine) {
    return NextResponse.json({ error: "BudgetLine model not configured" }, { status: 501 });
  }

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) return NextResponse.json({ error: "Budget line id is required" }, { status: 400 });

    const existing = await prisma.budgetLine.findFirst({ where: { id, userId: session.id } });
    if (!existing) return NextResponse.json({ error: "Budget line not found" }, { status: 404 });

    const data: Prisma.BudgetLineUpdateInput = {};
    if (body.category) data.category = body.category;
    if (body.allocated !== undefined) data.allocated = Number(body.allocated);
    if (body.spent !== undefined) data.spent = Number(body.spent);
    if (body.status) data.status = body.status;
    if (body.owner) data.owner = body.owner;

    const line = await prisma.budgetLine.update({ where: { id }, data });
    return NextResponse.json(line);
  } catch (error) {
    console.error("PATCH /api/budget-lines", error);
    return NextResponse.json({ error: "Failed to update budget line" }, { status: 500 });
  }
}
