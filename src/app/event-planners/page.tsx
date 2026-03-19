"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Star,
  CalendarCheck,
  Briefcase,
  Globe,
  Phone,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const gradients = [
  "bg-gradient-to-br from-[#9B0000] to-[#6A0000]",
  "bg-gradient-to-br from-[#8B0000] to-[#5A0000]",
  "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
  "bg-gradient-to-br from-[#8B1010] to-[#5A0010]",
  "bg-gradient-to-br from-[#9A0000] to-[#6A0000]",
];

const serviceFilters = [
  { id: "all", label: "All" },
  { id: "wedding", label: "Wedding" },
  { id: "corporate", label: "Corporate" },
  { id: "social", label: "Social" },
  { id: "destination", label: "Destination" },
];

interface Planner {
  id: string;
  userId: string;
  companyName: string;
  services: string | null;
  description: string | null;
  website: string | null;
  phone: string | null;
  gradient: string;
  eventCount: number;
  userName: string;
}

export default function EventPlannersPage() {
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/event-planners", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load planners");
        const data = await res.json();
        if (!active) return;
        const mapped: Planner[] = (Array.isArray(data) ? data : []).map(
          (p: any, idx: number) => ({
            id: p.id,
            userId: p.user?.id || p.userId || "",
            companyName: p.companyName || p.user?.name || "Event Planner",
            services: p.services || null,
            description: p.description || null,
            website: p.website || null,
            phone: p.phone || null,
            gradient: gradients[idx % gradients.length],
            eventCount: Array.isArray(p.events) ? p.events.length : 0,
            userName: p.user?.name || p.user?.email || "",
          })
        );
        setPlanners(mapped);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load planners");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filteredPlanners = useMemo(() => {
    return planners.filter((p) => {
      const matchSearch =
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.services || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchService =
        selectedService === "all" ||
        (p.services || "").toLowerCase().includes(selectedService);
      return matchSearch && matchService;
    });
  }, [planners, searchQuery, selectedService]);

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-serif text-white mb-4">
                Find Your Perfect{" "}
                <span className="text-[#C6A14A]">Event Planner</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Browse verified event planners who bring your vision to life —
                from intimate celebrations to grand weddings
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/signup?role=planner"
                  className="px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  Join as a Planner
                </Link>
                <Link
                  href="/planner"
                  className="px-6 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
                >
                  Try Planning Tools
                </Link>
              </div>
            </motion.div>

            {/* Service Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 overflow-x-auto"
            >
              <div className="flex gap-3 pb-2">
                {serviceFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => setSelectedService(sf.id)}
                    className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      selectedService === sf.id
                        ? "bg-[#C6A14A] text-black"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-xl p-4 border border-[#C6A14A]/20">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20">
                    <Search size={20} className="text-[#C6A14A]" />
                    <input
                      type="text"
                      placeholder="Search planners by name or service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal size={20} />
                    Filters
                  </button>
                </div>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/20"
                  >
                    <p className="text-sm text-gray-400">
                      More filters coming soon — event type, city, budget range.
                    </p>
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
                Showing{" "}
                <span className="text-[#C6A14A] font-semibold">
                  {filteredPlanners.length}
                </span>{" "}
                event planners
                {loading && " (loading...)"}
                {error && <span className="text-red-300"> · {error}</span>}
              </p>
            </motion.div>

            {/* Planners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlanners.map((planner, idx) => (
                <motion.div
                  key={planner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <div className="group">
                    <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#C6A14A]/20 transition-all duration-300 border border-[#C6A14A]/20">
                      {/* Header gradient */}
                      <div className={`h-32 relative ${planner.gradient}`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-4 left-5 flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#C6A14A] flex items-center justify-center text-black text-xl font-bold">
                            {planner.companyName.charAt(0)}
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 bg-[#C6A14A] text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle size={12} />
                          Verified
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-[#C6A14A] transition-colors">
                          {planner.companyName}
                        </h3>
                        {planner.userName && planner.userName !== planner.companyName && (
                          <p className="text-sm text-gray-400 mb-3">
                            by {planner.userName}
                          </p>
                        )}

                        {planner.description && (
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {planner.description}
                          </p>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-300">
                            <CalendarCheck size={14} className="text-[#C6A14A]" />
                            <span>
                              {planner.eventCount}{" "}
                              {planner.eventCount === 1 ? "event" : "events"}
                            </span>
                          </div>
                          {planner.website && (
                            <div className="flex items-center gap-1 text-gray-300">
                              <Globe size={14} className="text-[#C6A14A]" />
                              <span>Website</span>
                            </div>
                          )}
                        </div>

                        {/* Services */}
                        <div className="border-t border-gray-700 pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase size={14} className="text-[#C6A14A]" />
                            <span className="text-gray-400 text-sm">
                              Services
                            </span>
                          </div>
                          <p className="text-[#C6A14A] font-semibold text-sm truncate">
                            {planner.services || "Full-service planning"}
                          </p>
                        </div>

                        {/* Contact CTA */}
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/contact?plannerUserId=${planner.userId}&plannerName=${encodeURIComponent(planner.companyName)}`}
                            className="flex-1 text-center py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors text-sm"
                          >
                            Get in Touch
                          </Link>
                          {planner.phone && (
                            <a
                              href={`tel:${planner.phone}`}
                              className="px-3 py-2 border border-[#C6A14A] text-[#C6A14A] rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
                              title="Call"
                            >
                              <Phone size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {!loading && filteredPlanners.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-400 text-lg">
                  {error
                    ? "Unable to load planners right now."
                    : "No event planners found matching your criteria."}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedService("all");
                  }}
                  className="mt-4 px-6 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}

            {/* Why hire a planner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-8 border border-[#C6A14A]/20"
            >
              <h2 className="text-2xl font-serif text-white mb-6 text-center">
                Why Hire an Event Planner?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: Sparkles,
                    title: "Stress-Free Planning",
                    desc: "From venue scouting to day-of coordination, let a pro handle the details.",
                  },
                  {
                    icon: Briefcase,
                    title: "Vendor Connections",
                    desc: "Planners have trusted networks of caterers, decorators, and photographers.",
                  },
                  {
                    icon: CalendarCheck,
                    title: "On-Time Execution",
                    desc: "Professional timeline management ensures every moment runs seamlessly.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="text-center space-y-3 p-4"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-[#C6A14A]/20 flex items-center justify-center">
                      <item.icon size={24} className="text-[#C6A14A]" />
                    </div>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
