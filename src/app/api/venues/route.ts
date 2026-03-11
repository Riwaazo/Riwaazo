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
      vendorProfile: { select: { id: true, userId: true } },
    },
  });

  const rawRole = (user.user_metadata?.role as string | undefined)?.toUpperCase();
  const role = rawRole === "VENUE-OWNER" ? "VENUE" : rawRole || dbUser?.role || "USER";

  return {
    id: user.id,
    role,
    vendorProfileId: dbUser?.vendorProfile?.id || null,
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let where: Prisma.VenueWhereInput = {};
    switch (session.role) {
      case "ADMIN":
        break;
      case "VENDOR":
        where = {
          OR: [
            { vendorId: session.vendorProfileId || "" },
            { ownerId: session.id },
            { vendor: { userId: session.id } },
          ],
        };
        break;
      case "VENUE":
        where = { ownerId: session.id };
        break;
      default:
        where = { bookings: { some: { userId: session.id } } };
    }

    const statusFilter: Prisma.VenueWhereInput =
      session.role === "ADMIN" || session.role === "VENDOR" || session.role === "VENUE"
        ? {}
        : { status: "APPROVED" };

    const venues = await prisma.venue.findMany({
      where: { AND: [where, statusFilter] },
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            phone: true,
            services: true,
            user: { select: { id: true } },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(venues);
  } catch (error) {
    console.error("GET /api/venues", error);
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { venue } = body as {
      venue?: {
        id?: string;
        name?: string;
        location?: string;
        mapEmbedUrl?: string;
        capacity?: number;
        priceRange?: string;
        amenities?: string[];
        images?: string[];
        description?: string;
      };
    };

    if (!venue?.id) return NextResponse.json({ error: "Venue id required" }, { status: 400 });

    const existing = await prisma.venue.findUnique({ where: { id: venue.id }, select: { ownerId: true } });
    if (!existing) return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    if (existing.ownerId !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.venue.update({
      where: { id: venue.id },
      data: {
        ...(venue.name !== undefined ? { name: venue.name } : {}),
        ...(venue.location !== undefined ? { location: venue.location } : {}),
        ...(venue.mapEmbedUrl !== undefined ? { mapEmbedUrl: venue.mapEmbedUrl } : {}),
        ...(venue.capacity !== undefined ? { capacity: venue.capacity } : {}),
        ...(venue.priceRange !== undefined ? { priceRange: venue.priceRange } : {}),
        ...(venue.amenities !== undefined ? { amenities: venue.amenities } : {}),
        ...(venue.images !== undefined ? { images: venue.images } : {}),
        ...(venue.description !== undefined ? { description: venue.description } : {}),
      },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            phone: true,
            services: true,
            user: { select: { id: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PATCH /api/venues", error);
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
  }
}
