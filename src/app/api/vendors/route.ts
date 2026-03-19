import { NextRequest, NextResponse } from "next/server";
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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      email: true,
      vendorProfile: { select: { id: true } },
    },
  });

  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase() || dbUser?.role || "USER";

  return {
    id: user.id,
    role,
    email: dbUser?.email || user.email || undefined,
    name:
      (user.user_metadata?.name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.given_name as string | undefined) ||
      undefined,
    vendorProfileId: dbUser?.vendorProfile?.id || null,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const vendorId = url.searchParams.get("id") || url.searchParams.get("vendorId");
  const isPublic = url.searchParams.get("public") === "1" || url.searchParams.get("public") === "true";

  // Public fetch by ID for storefront
  if (vendorId) {
    try {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          venues: {
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
              mapEmbedUrl: true,
              capacity: true,
              priceRange: true,
              amenities: true,
              images: true,
              description: true,
              eventTypes: true,
            },
          },
          bookings: {
            select: { id: true, status: true, eventDate: true, userId: true, venueId: true },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { packagesDraft: _pd, ...rest } = vendor as any;
      return NextResponse.json(rest, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch vendor";
      console.error("GET /api/vendors?id", message);
      return NextResponse.json({ error: "Failed to fetch vendor", detail: message }, { status: 500 });
    }
  }

  if (isPublic) {
    try {
      const vendors = await prisma.vendorProfile.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          venues: {
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
              images: true,
              eventTypes: true,
            },
          },
        },
      });
      const sanitized = vendors.map((v: any) => {
        const { packagesDraft: _pd, ...rest } = v;
        return rest;
      });
      return NextResponse.json(sanitized, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch vendors";
      console.error("GET /api/vendors public", message);
      return NextResponse.json({ error: "Failed to fetch vendors", detail: message }, { status: 500 });
    }
  }

  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let where: Prisma.VendorProfileWhereInput = {};
    switch (session.role) {
      case "ADMIN":
        break;
      case "VENDOR": {
        // Only filter by vendorProfileId when it exists to avoid invalid UUID parsing
        const filters: Prisma.VendorProfileWhereInput[] = [{ userId: session.id }];
        if (session.vendorProfileId) {
          filters.push({ id: session.vendorProfileId });
        }
        where = { OR: filters };
        break;
      }
      default:
        where = {
          OR: [
            { bookings: { some: { userId: session.id } } },
            { venues: { some: { ownerId: session.id } } },
          ],
        };
    }

    const statusFilter: Prisma.VendorProfileWhereInput =
      session.role === "ADMIN" || session.role === "VENDOR"
        ? {}
        : { status: "APPROVED" };

    const vendors = await prisma.vendorProfile.findMany({
      where: { AND: [where, statusFilter] },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        venues: { select: { id: true, name: true, slug: true, location: true, mapEmbedUrl: true, capacity: true, priceRange: true, images: true, description: true, amenities: true, eventTypes: true } },
      },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch vendors";
    console.error("GET /api/vendors", message);
    return NextResponse.json({ error: "Failed to fetch vendors", detail: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { vendor, venue, user } = body as {
      vendor?: { companyName?: string; services?: string; phone?: string; description?: string; website?: string; eventTypes?: string[]; location?: string; mapEmbedUrl?: string; packages?: any };
      venue?: { id?: string; name?: string; location?: string; mapEmbedUrl?: string; capacity?: number; priceRange?: string; amenities?: string[]; images?: string[]; description?: string; eventTypes?: string[] };
      user?: { name?: string };
    };

    if (!vendor && !venue && !user) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    // Resolve or create the vendor profile if the session is vendor but missing vendorProfileId
    let vendorProfileId = session.vendorProfileId;
    if (!vendorProfileId) {
      const existing = await prisma.vendorProfile.findFirst({ where: { userId: session.id }, select: { id: true } });
      if (existing) {
        vendorProfileId = existing.id;
      } else {
        // Ensure the user row exists to satisfy FK constraint
        let ensuredUserId = session.id;
        const existingUser = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true } });
        if (!existingUser) {
          if (!session.email) {
            return NextResponse.json({ error: "User email required to create vendor profile" }, { status: 400 });
          }
          const createdUser = await prisma.user.create({
            data: {
              id: session.id,
              email: session.email,
              name: session.name || session.email.split("@")[0],
              role: "VENDOR",
            },
            select: { id: true },
          });
          ensuredUserId = createdUser.id;
        }

        const created = await prisma.vendorProfile.create({
          data: {
            userId: ensuredUserId,
            companyName: vendor?.companyName || "Vendor profile",
            status: "PENDING",
            packages: vendor?.packages,
            packagesDraft: vendor?.packages,
          },
          select: { id: true },
        });
        vendorProfileId = created.id;
      }
    }

    if (!vendorProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData: Prisma.VendorProfileUpdateArgs = {
      where: { id: vendorProfileId },
      data: {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        venues: { select: { id: true, name: true, slug: true, location: true, mapEmbedUrl: true, priceRange: true, images: true, description: true, amenities: true } },
      },
    };

    if (user?.name !== undefined) {
      updateData.data = {
        ...updateData.data,
        user: {
          update: {
            name: user.name,
          },
        },
      } as any;
    }

    if (vendor) {
      updateData.data = {
        ...updateData.data,
        ...(vendor.companyName ? { companyName: vendor.companyName } : {}),
        ...(vendor.services !== undefined ? { services: vendor.services } : {}),
        ...(vendor.packages !== undefined ? { packages: vendor.packages } : {}),
        ...(vendor.eventTypes !== undefined ? { eventTypes: vendor.eventTypes } : {}),
        ...(vendor.location !== undefined ? { location: vendor.location } : {}),
        ...(vendor.mapEmbedUrl !== undefined ? { mapEmbedUrl: vendor.mapEmbedUrl } : {}),
        ...(vendor.phone !== undefined ? { phone: vendor.phone } : {}),
        ...(vendor.description !== undefined ? { description: vendor.description } : {}),
        ...(vendor.website !== undefined ? { website: vendor.website } : {}),
      };
    }

    // Only allow touching venues that belong to this vendor
    if (venue) {
      const targetVenueId = venue.id || undefined;
      const venueData = {
        ...(venue.name !== undefined ? { name: venue.name } : {}),
        ...(venue.location !== undefined ? { location: venue.location } : {}),
        ...(venue.mapEmbedUrl !== undefined ? { mapEmbedUrl: venue.mapEmbedUrl } : {}),
        ...(venue.capacity !== undefined ? { capacity: venue.capacity } : {}),
        ...(venue.priceRange !== undefined ? { priceRange: venue.priceRange } : {}),
        ...(venue.amenities !== undefined ? { amenities: venue.amenities } : {}),
        ...(venue.images !== undefined ? { images: venue.images } : {}),
        ...(venue.description !== undefined ? { description: venue.description } : {}),
        ...(venue.eventTypes !== undefined ? { eventTypes: venue.eventTypes } : {}),
      } as Prisma.VenueUpdateWithoutVendorInput;

      // Update existing venue when id is provided
      if (targetVenueId) {
        updateData.data = {
          ...updateData.data,
          venues: {
            update: [
              {
                where: { id: targetVenueId, vendorId: vendorProfileId },
                data: venueData,
              },
            ],
          },
        };
      } else {
        // Create primary venue if none exists
        const name = (venue.name || "Untitled venue").trim();
        const slug = slugify(name);
        updateData.data = {
          ...updateData.data,
          venues: {
            create: [
              {
                name,
                slug,
                location: venue.location,
                mapEmbedUrl: venue.mapEmbedUrl,
                capacity: venue.capacity,
                priceRange: venue.priceRange,
                amenities: venue.amenities || [],
                images: venue.images || [],
                description: venue.description,
                eventTypes: venue.eventTypes || [],
                status: "PENDING",
              },
            ],
          },
        };
      }
    }

    const updated = await prisma.vendorProfile.update(updateData);
    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update vendor";
    console.error("PATCH /api/vendors", message);
    return NextResponse.json({ error: "Failed to update vendor", detail: message }, { status: 500 });
  }
}
