import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
