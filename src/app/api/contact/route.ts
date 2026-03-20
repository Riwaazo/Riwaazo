import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, date, eventType, guests, message, plannerUserId } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const summary = `New inquiry from ${name} (${email})${phone ? ` | Phone: ${phone}` : ""}${date ? ` | Date: ${date}` : ""}${eventType ? ` | Type: ${eventType}` : ""}${guests ? ` | Guests: ${guests}` : ""} — ${message}`;

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      userId: admin.id,
      title: summary,
      category: "inquiry",
    }));

    // If inquiry is directed at a specific planner, notify them too
    if (plannerUserId && typeof plannerUserId === "string") {
      const plannerExists = await prisma.user.findUnique({ where: { id: plannerUserId }, select: { id: true } });
      if (plannerExists && !admins.some((a) => a.id === plannerUserId)) {
        notifications.push({
          userId: plannerUserId,
          title: summary,
          category: "inquiry",
        });
      }
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
