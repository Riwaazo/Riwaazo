import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const metaRole = (user.user_metadata?.role as string | undefined)?.toLowerCase();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  const dbRole = dbUser?.role?.toLowerCase();

  const isAdmin = metaRole === "admin" || dbRole === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ ok: true, role: metaRole || dbRole || "admin" }, { headers: { "Cache-Control": "no-store" } });
}
