import { NextResponse } from "next/server";
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

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
