import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
    },
  });

  const rawRole = (user.user_metadata?.role as string | undefined)?.toUpperCase();
  const mappedRole = rawRole === "VENUE-OWNER" ? "VENUE" : rawRole;
  const role = mappedRole || dbUser?.role || "USER";

  return {
    id: dbUser?.id || user.id,
    email: dbUser?.email || user.email,
    role,
  };
}

async function getBookingWithAccess(bookingId: string, session: { id: string; email?: string | null; role: string }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, email: true } },
      venue: { select: { id: true, ownerId: true, owner: { select: { email: true } } } },
      vendor: { select: { id: true, userId: true } },
    },
  });
  if (!booking) return null;

  const isAdmin = session.role === "ADMIN";
  const isRequester = booking.userId === session.id || (!!session.email && booking.user?.email === session.email);
  const isOwner = booking.venue?.ownerId === session.id || (!!session.email && booking.venue?.owner?.email === session.email);
  const isVendor = (booking.vendor?.userId && booking.vendor.userId === session.id) || (booking.vendorId && booking.vendorId === session.id);

  if (!(isAdmin || isRequester || isOwner || isVendor)) return null;
  return booking;
}

export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookingId = req.nextUrl.searchParams.get("bookingId")?.trim();
  if (!bookingId) return NextResponse.json({ error: "bookingId is required" }, { status: 400 });

  const booking = await getBookingWithAccess(bookingId, session);
  if (!booking) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  try {
    const messages = await prisma.bookingMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch booking messages";
    console.error("GET /api/bookings/messages", message);
    return NextResponse.json({ error: "Failed to fetch booking messages", detail: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const bookingId = (body?.bookingId as string | undefined)?.trim();
    const content = (body?.content as string | undefined)?.trim();

    if (!bookingId || !content) return NextResponse.json({ error: "bookingId and content are required" }, { status: 400 });

    const booking = await getBookingWithAccess(bookingId, session);
    if (!booking) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

    const message = await prisma.bookingMessage.create({
      data: {
        bookingId,
        senderId: session.id,
        senderRole: session.role,
        content,
        ...(Array.isArray(body?.attachments) && body.attachments.length > 0
          ? { attachments: body.attachments }
          : {}),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    console.error("POST /api/bookings/messages", message);
    return NextResponse.json({ error: "Failed to send message", detail: message }, { status: 500 });
  }
}
