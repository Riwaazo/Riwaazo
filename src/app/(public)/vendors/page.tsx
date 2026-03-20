"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  SlidersHorizontal,
  Camera,
  Utensils,
  Music,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const categories = [
  { id: "catering", name: "Catering", icon: Utensils },
  { id: "photography", name: "Photography", icon: Camera },
  { id: "decor", name: "Decor", icon: Palette },
  { id: "dj", name: "DJ & Music", icon: Music },
  { id: "makeup", name: "Makeup & Beauty", icon: Sparkles },
  { id: "planning", name: "Event Planning", icon: Users },
];

const gradients = [
  "bg-gradient-to-br from-[#9B0000] to-[#6A0000]",
  "bg-gradient-to-br from-[#8B0000] to-[#5A0000]",
  "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
  "bg-gradient-to-br from-[#8B1010] to-[#5A0010]",
  "bg-gradient-to-br from-[#9A0000] to-[#6A0000]",
  "bg-gradient-to-br from-[#7A0000] to-[#5A0000]",
];

export default function VendorsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vendors?public=1", { cache: "no-store" });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(detail?.error || "Failed to load vendors");
        }
        const data = await res.json();
        if (!active) return;
        const mapped = (Array.isArray(data) ? data : []).map((v: any, idx: number) => {
          const venueImages = Array.isArray(v.venues) ? v.venues.flatMap((vn: any) => vn.images || []) : [];
          const image = venueImages[0];
          const location = v.location || v.venues?.[0]?.location || "Location TBD";
          const categoryMatch = categories.find((c) =>
            (v.services || "").toLowerCase().includes(c.name.toLowerCase()) ||
            (Array.isArray(v.eventTypes) && v.eventTypes.some((e: string) => e.toLowerCase().includes(c.id)))
          );
          return {
            id: v.id,
            name: v.companyName || v.user?.name || "Vendor",
            category: categoryMatch?.id || "all",
            rating: v.rating || "—",
            reviews: v.reviewCount || 0,
            priceRange: v.services?.length ? undefined : "On request",
            location,
            image: image || gradients[idx % gradients.length],
            verified: v.status === "APPROVED",
            services: v.services,
            eventTypes: v.eventTypes || [],
          };
        });
        setVendors(mapped);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load vendors");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const locations = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => v.location && set.add(v.location));
    return ["all", ...Array.from(set)];
  }, [vendors]);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || vendor.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-24 pb-12 sm:pb-16 sm:pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10 text-center sm:mb-12"
            >
              <h1 className="mb-4 text-3xl font-serif text-white sm:text-4xl lg:text-5xl">
                Find Your Perfect <span className="text-[#C6A14A]">Vendors</span>
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-gray-400 sm:text-base">
                  Connect with verified professionals for your special event
                  {error && <span className="text-red-300"> · {error}</span>}
                </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/vendors/join"
                  className="w-full rounded-lg bg-[#C6A14A] px-6 py-3 text-center font-semibold text-black transition-colors hover:bg-[#E8C56B] sm:w-auto"
                >
                  Become a Vendor
                </Link>
                <Link
                  href="/auth/signup?role=vendor"
                  className="w-full rounded-lg border border-[#C6A14A] px-6 py-3 text-center font-semibold text-[#C6A14A] transition-colors hover:bg-[#C6A14A]/10 sm:w-auto"
                >
                  Sign up now
                </Link>
              </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap xl:flex-nowrap xl:overflow-x-auto xl:pb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`min-w-0 rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all sm:text-base ${
                    selectedCategory === "all"
                      ? "bg-[#C6A14A] text-black"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`min-w-0 rounded-lg px-4 py-3 text-sm font-semibold transition-all sm:text-base lg:flex lg:items-center lg:justify-center lg:gap-2 ${
                        selectedCategory === category.id
                          ? "bg-[#C6A14A] text-black"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2 truncate">
                        <Icon size={18} className="shrink-0" />
                        <span className="truncate">{category.name}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-xl p-4 border border-[#C6A14A]/20">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20">
                    <Search size={20} className="text-[#C6A14A]" />
                    <input
                      type="text"
                      placeholder="Search vendors by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                    />
                  </div>

                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal size={20} />
                    Filters
                  </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/20"
                  >
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Location
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full sm:w-1/3 bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 outline-none border border-white/20"
                      >
                        {locations.map((location) => (
                          <option key={location} value={location} className="bg-black">
                            {location === "all" ? "All Locations" : location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Results Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6"
            >
              <p className="text-gray-400">
                Showing <span className="text-[#C6A14A] font-semibold">{filteredVendors.length}</span> vendors
                {loading && " (loading...)"}
                {error && <span className="text-red-300"> · {error}</span>}
              </p>
            </motion.div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link href={`/vendors/${vendor.id}`}>
                    <div className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#C6A14A]/20 transition-all duration-300 border border-[#C6A14A]/20">
                        {/* Image */}
                        <div
                          className={`h-48 relative overflow-hidden ${vendor.image.startsWith("http") ? "bg-cover bg-center" : vendor.image}`}
                          style={vendor.image.startsWith("http") ? { backgroundImage: `url(${vendor.image})` } : undefined}
                        >
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          {vendor.verified && (
                            <div className="absolute top-4 right-4 bg-[#C6A14A] text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Sparkles size={12} />
                              Verified
                            </div>
                          )}
                          {vendor.category !== "all" && (
                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs capitalize">
                              {categories.find((c) => c.id === vendor.category)?.name}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-[#C6A14A] transition-colors">
                            {vendor.name}
                          </h3>

                          {/* Location */}
                          <p className="text-gray-400 text-sm mb-3">
                            {vendor.location}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star
                                size={14}
                                className="text-[#C6A14A] fill-[#C6A14A]"
                              />
                              <span className="text-white font-semibold">
                                {vendor.rating}
                              </span>
                            </div>
                            <span className="text-gray-500 text-sm">
                              ({vendor.reviews} reviews)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="border-t border-gray-700 pt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">
                                Services
                              </span>
                              <span className="text-[#C6A14A] font-semibold truncate max-w-[60%]">
                                {vendor.services || "On request"}
                              </span>
                            </div>
                            {vendor.eventTypes?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {vendor.eventTypes.slice(0, 3).map((et: string) => (
                                  <span key={et} className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                    {et}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredVendors.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-400 text-lg">
                  No vendors found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedLocation("all");
                  }}
                  className="mt-4 px-6 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
