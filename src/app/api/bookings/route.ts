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
      email: true,
      vendorProfile: { select: { id: true } },
    },
  });

  const rawRole = (user.user_metadata?.role as string | undefined)?.toUpperCase();
  const mappedRole = rawRole === "VENUE-OWNER" ? "VENUE" : rawRole;
  const role = mappedRole || dbUser?.role || "USER";

  return {
    id: dbUser?.id || user.id,
    role,
    email: dbUser?.email || user.email,
    vendorProfileId: dbUser?.vendorProfile?.id || null,
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let where: Prisma.BookingWhereInput = {};
    switch (session.role) {
      case "ADMIN":
        break;
      case "VENDOR": {
        const filters: Prisma.BookingWhereInput[] = [{ venue: { ownerId: session.id } }];
        if (session.vendorProfileId) {
          filters.push({ vendorId: session.vendorProfileId });
          filters.push({ venue: { vendorId: session.vendorProfileId } });
        }
        where = { OR: filters };
        break;
      }
      case "VENUE": {
        const ownerFilters: Prisma.BookingWhereInput[] = [{ venue: { ownerId: session.id } }];
        if (session.email) {
          ownerFilters.push({ venue: { owner: { email: session.email } } });
        }
        where = { OR: ownerFilters };
        break;
      }
      default:
        where = { userId: session.id };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            ownerId: true,
            vendorId: true,
          },
        },
        vendor: { select: { id: true, companyName: true, user: { select: { id: true } } } },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch bookings";
    console.error("GET /api/bookings", message);
    return NextResponse.json({ error: "Failed to fetch bookings", detail: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const venueId = (body?.venueId as string | undefined)?.trim();
    if (!venueId) return NextResponse.json({ error: "venueId is required" }, { status: 400 });

    const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { id: true, vendorId: true, ownerId: true } });
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    const eventDateInput = body?.eventDate as string | undefined;
    const eventDate = eventDateInput ? new Date(eventDateInput) : new Date();
    const guestCount = Number(body?.guestCount);
    const parsedGuestCount = Number.isFinite(guestCount) ? guestCount : null;

    const booking = await prisma.booking.create({
      data: {
        userId: session.id,
        venueId: venue.id,
        vendorId: venue.vendorId || null,
        status: "PENDING",
        eventDate,
        guestCount: parsedGuestCount,
        notes: (body?.notes as string | undefined) || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true, location: true, ownerId: true } },
        vendor: { select: { id: true, companyName: true, user: { select: { id: true } } } },
      },
    });

    // Notify venue owner and vendor about the new booking
    const notifyIds = new Set<string>();
    if (booking.venue?.ownerId) notifyIds.add(booking.venue.ownerId);
    if (booking.vendor?.user?.id) notifyIds.add(booking.vendor.user.id);
    notifyIds.delete(session.id); // don't notify the person who made the booking

    if (notifyIds.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(notifyIds).map((userId) => ({
          userId,
          title: `New booking request from ${booking.user?.name || booking.user?.email || "a client"} for ${booking.venue?.name || "your venue"}`,
          category: "BOOKING",
        })),
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create booking";
    console.error("POST /api/bookings", message);
    return NextResponse.json({ error: "Failed to create booking", detail: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const id = (body?.id as string | undefined)?.trim();
    const status = (body?.status as Prisma.BookingUncheckedUpdateInput["status"]) || null;
    if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true } },
        venue: { select: { ownerId: true } },
        vendor: { select: { user: { select: { id: true } } } },
      },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const isAdmin = session.role === "ADMIN";
    const isVendor = booking.vendor?.user?.id === session.id || booking.vendorId === session.vendorProfileId;
    const isVenueOwner = booking.venue?.ownerId === session.id;
    if (!(isAdmin || isVendor || isVenueOwner)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true } },
        venue: { select: { ownerId: true } },
        vendor: { select: { user: { select: { id: true } } } },
      },
    });

    const notifyIds = new Set<string>();
    if (updated.userId) notifyIds.add(updated.userId);
    if (updated.vendor?.user?.id) notifyIds.add(updated.vendor.user.id);
    if (updated.venue?.ownerId) notifyIds.add(updated.venue.ownerId);

    const title = status === "CONFIRMED" ? "Your booking was confirmed" : status === "CANCELLED" ? "Your booking was declined" : "Booking status updated";
    await Promise.all(
      Array.from(notifyIds).map((userId) =>
        prisma.notification.create({ data: { userId, title, category: "BOOKING" } })
      )
    );

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update booking";
    console.error("PATCH /api/bookings", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
