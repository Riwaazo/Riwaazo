import { PrismaClient, Role, BookingStatus, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.eventPlannerProfile.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const clientUser = await prisma.user.create({
    data: {
      email: "client@example.com",
      name: "Olivia Client",
      role: Role.USER,
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      email: "vendor@example.com",
      name: "Adeel Vendor",
      role: Role.VENDOR,
    },
  });

  const venueOwner = await prisma.user.create({
    data: {
      email: "owner@example.com",
      name: "Sana VenueOwner",
      role: Role.VENUE,
    },
  });

  const plannerUser = await prisma.user.create({
    data: {
      email: "planner@example.com",
      name: "Maya Planner",
      role: Role.EVENT_PLANNER,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
    },
  });

  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      companyName: "Golden Events Co.",
      phone: "+92 300 1234567",
      services: "Catering, Decor, Lighting",
      description: "Full-service event vendor for weddings and corporate functions.",
      website: "https://golden-events.example.com",
    },
  });

  const plannerProfile = await prisma.eventPlannerProfile.create({
    data: {
      userId: plannerUser.id,
      companyName: "PlanPerfect Studio",
      phone: "+92 333 9876543",
      services: "Full planning, design, coordination",
      description: "Boutique event planning with curated vendors and timelines.",
      website: "https://planperfect.example.com",
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: "Aurora Banquets",
      slug: "aurora-banquets",
      location: "Lahore, Pakistan",
      capacity: 300,
      priceRange: "PKR 200k - 500k",
      description: "Modern banquet hall with ambient lighting and indoor/outdoor options.",
      amenities: ["Parking", "Bridal Suite", "AV", "Catering", "Generator Backup"],
      images: [
        "https://images.unsplash.com/photo-1529634899554-1c1a26ad6b48",
        "https://images.unsplash.com/photo-1521540216272-a50305cd4421",
      ],
      vendorId: vendorProfile.id,
      ownerId: venueOwner.id,
    },
  });

  const event = await prisma.event.create({
    data: {
      title: "Mehndi Night",
      description: "Colorful mehndi with dholki, dance floor, and live food stations.",
      date: new Date("2025-12-15T18:00:00Z"),
      status: EventStatus.PUBLISHED,
      budget: 400000,
      venueId: venue.id,
      organizerId: clientUser.id,
      eventPlannerId: plannerProfile.id,
    },
  });

  await prisma.booking.create({
    data: {
      userId: clientUser.id,
      venueId: venue.id,
      vendorId: vendorProfile.id,
      status: BookingStatus.CONFIRMED,
      eventDate: event.date ?? new Date(),
      guestCount: 250,
      notes: "Need yellow theme with fairy lights and live dessert counter.",
    },
  });

  console.log("Seed data inserted ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
