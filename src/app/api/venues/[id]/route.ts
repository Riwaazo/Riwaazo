import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const venue = await prisma.venue.findUnique({
      where: { id: params.id },
      include: {
        vendor: {
          select: { id: true, companyName: true, phone: true, services: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            eventDate: true,
            guestCount: true,
            notes: true,
          },
          orderBy: { createdAt: "desc" },
        },
        events: {
          select: {
            id: true,
            title: true,
            date: true,
            status: true,
            budget: true,
            eventPlanner: { select: { id: true, companyName: true, phone: true } },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error("GET /api/venues/[id]", error);
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
  }
}
