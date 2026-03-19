import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.eventPlannerProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      events: { select: { id: true, title: true, date: true, status: true } },
    },
  });

  if (!profile) return NextResponse.json({ error: "No profile found" }, { status: 404 });
  return NextResponse.json(profile);
}
