import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { Prisma } from "@prisma/client";

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40) || "venue";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

async function getSessionUser() {
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
    select: {
      id: true,
      role: true,
      vendorProfile: { select: { id: true, userId: true } },
    },
  });

  const rawRole = (user.user_metadata?.role as string | undefined)?.toUpperCase();
  const resolvedRole = rawRole === "VENUE-OWNER" ? "VENUE" : rawRole;
  const role = resolvedRole || dbUser?.role || "USER";

  return {
    id: dbUser?.id || user.id,
    role,
    vendorProfileId: dbUser?.vendorProfile?.id || null,
  };
}

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role !== "VENUE" && session.role !== "VENDOR" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { venue } = body as {
      venue?: {
        name?: string;
        location?: string;
        mapEmbedUrl?: string;
        capacity?: number;
        priceRange?: string;
        amenities?: string[];
        images?: string[];
        description?: string;
        eventTypes?: string[];
      };
    };

    const name = (venue?.name || "Untitled venue").trim();
    const slug = slugify(name);

    const data: Prisma.VenueCreateInput = {
      name,
      slug,
      location: venue?.location,
      mapEmbedUrl: venue?.mapEmbedUrl,
      capacity: venue?.capacity,
      priceRange: venue?.priceRange,
      amenities: venue?.amenities || [],
      images: venue?.images || [],
      description: venue?.description,
      eventTypes: venue?.eventTypes || [],
    };

    if (session.role === "VENUE") {
      data.owner = { connect: { id: session.id } };
    }

    if (session.role === "VENDOR" && session.vendorProfileId) {
      data.vendor = { connect: { id: session.vendorProfileId } };
    }

    const created = await prisma.venue.create({
      data,
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

    // Notify admins for approval
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: `New venue pending approval: ${name}`,
          category: "VENUE_APPROVAL",
        })),
      });
    }

    return NextResponse.json(created, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("POST /api/venues", error);
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSessionUser();
  const isPublic = !session;

  try {
    let where: Prisma.VenueWhereInput = {};
    switch (session?.role) {
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
      case undefined:
        break;
      default:
        // Regular logged-in users should see approved venues; no booking filter
        break;
    }

    const statusFilter: Prisma.VenueWhereInput = isPublic
      ? { status: "APPROVED" }
      : session?.role === "ADMIN" || session?.role === "VENDOR" || session?.role === "VENUE"
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
        eventTypes?: string[];
      };
    };

    if (!venue?.id) return NextResponse.json({ error: "Venue id required" }, { status: 400 });

    const existing = await prisma.venue.findUnique({
      where: { id: venue.id },
      select: {
        ownerId: true,
        vendorId: true,
        vendor: { select: { userId: true } },
      },
    });
    if (!existing) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    const isOwner = existing.ownerId === session.id;
    const isVendorByProfile = existing.vendorId && existing.vendorId === session.vendorProfileId;
    const isVendorByUser = existing.vendor?.userId === session.id;

    if (!isOwner && !isVendorByProfile && !isVendorByUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
        ...(venue.eventTypes !== undefined ? { eventTypes: venue.eventTypes } : {}),
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
