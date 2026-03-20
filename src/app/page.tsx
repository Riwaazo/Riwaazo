import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/marketplace/HeroSection";
import FeaturedVenues from "@/components/marketplace/FeaturedVenues";
import CuratedProfessionals from "@/components/marketplace/CuratedProfessionals";
import BudgetCalculator from "@/components/marketplace/BudgetCalculator";
import TrustAndProof from "@/components/marketplace/TrustAndProof";
import Footer from "@/components/shared/Footer";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featuredVenuesPromise = prisma.venue.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: {
      id: true,
      slug: true,
      name: true,
      location: true,
      priceRange: true,
      rating: true,
      capacity: true,
      images: true,
    },
  });

  const approvedVendorsPromise = prisma.vendorProfile.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      companyName: true,
      services: true,
      eventTypes: true,
      venues: { select: { id: true } },
    },
  });

  const approvedVenuesCountPromise = prisma.venue.count({ where: { status: "APPROVED" } });
  const approvedVendorsCountPromise = prisma.vendorProfile.count({ where: { status: "APPROVED" } });

  return Promise.all([
    featuredVenuesPromise,
    approvedVendorsPromise,
    approvedVenuesCountPromise,
    approvedVendorsCountPromise,
  ]).then(([featuredVenuesRaw, approvedVendors, approvedVenuesCount, approvedVendorsCount]) => {
    const featuredVenues = featuredVenuesRaw.map((venue, index) => ({
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      location: venue.location || "Location on request",
      price: venue.priceRange || "On request",
      rating: venue.rating && venue.rating > 0 ? Number(venue.rating.toFixed(1)) : 4.8,
      reviews: 24 + index * 19,
      capacity: venue.capacity ? `${venue.capacity}+ guests` : "Capacity on request",
      image: venue.images?.[0] || null,
    }));

    const categoryMap = new Map<string, { name: string; description: string; count: number }>();
    for (const vendor of approvedVendors) {
      const rawTypes = vendor.eventTypes.length > 0
        ? vendor.eventTypes
        : vendor.services?.split(",").map((item) => item.trim()).filter(Boolean) || [];
      for (const type of rawTypes.slice(0, 3)) {
        const key = type.toLowerCase();
        const existing = categoryMap.get(key);
        categoryMap.set(key, {
          name: type,
          description: existing?.description || `${type} specialists ready for premium events`,
          count: (existing?.count || 0) + 1,
        });
      }
    }

    const professionalCategories = Array.from(categoryMap.values())
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);

    const heroStats = {
      venues: approvedVenuesCount,
      vendors: approvedVendorsCount,
      cities: new Set(featuredVenuesRaw.map((venue) => venue.location).filter(Boolean)).size,
    };

    return (
      <SwipeTransition>
        <Navbar />
        <main className="bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000]">
          <HeroSection stats={heroStats} />
          <FeaturedVenues venues={featuredVenues} />
          <CuratedProfessionals categories={professionalCategories} totalVendors={approvedVendorsCount} />
          <BudgetCalculator />
          <TrustAndProof stats={heroStats} />
          <Footer />
        </main>
      </SwipeTransition>
    );
  });
}
