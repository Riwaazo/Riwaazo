import { NextRequest, NextResponse } from "next/server";
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
      vendorProfile: { select: { id: true } },
    },
  });

  const role = (user.user_metadata?.role as string | undefined)?.toUpperCase() || dbUser?.role || "USER";

  return {
    id: user.id,
    role,
    vendorProfileId: dbUser?.vendorProfile?.id || null,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const vendorId = url.searchParams.get("id") || url.searchParams.get("vendorId");

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
      return NextResponse.json(vendor, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch vendor";
      console.error("GET /api/vendors?id", message);
      return NextResponse.json({ error: "Failed to fetch vendor", detail: message }, { status: 500 });
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
        venues: { select: { id: true, name: true, slug: true, location: true, mapEmbedUrl: true, capacity: true, priceRange: true, images: true, description: true, amenities: true } },
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
  if (!session || session.role !== "VENDOR" || !session.vendorProfileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { vendor, venue, user } = body as {
      vendor?: { companyName?: string; services?: string; phone?: string; description?: string; website?: string };
      venue?: { id?: string; name?: string; location?: string; mapEmbedUrl?: string; capacity?: number; priceRange?: string; amenities?: string[]; images?: string[]; description?: string };
      user?: { name?: string };
    };

    if (!vendor && !venue && !user) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const updateData: Prisma.VendorProfileUpdateArgs = {
      where: { id: session.vendorProfileId },
      data: {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        venues: { select: { id: true, name: true, slug: true, location: true, priceRange: true, images: true, description: true, amenities: true } },
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
        ...(vendor.phone !== undefined ? { phone: vendor.phone } : {}),
        ...(vendor.description !== undefined ? { description: vendor.description } : {}),
        ...(vendor.website !== undefined ? { website: vendor.website } : {}),
      };
    }

    // Only allow touching venues that belong to this vendor
    if (venue) {
      const targetVenueId = venue.id || undefined;
      if (targetVenueId) {
        updateData.data = {
          ...updateData.data,
          venues: {
            update: [
              {
                where: { id: targetVenueId },
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
