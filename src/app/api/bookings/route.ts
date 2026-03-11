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
      case "VENUE":
        where = { venue: { ownerId: session.id } };
        break;
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
