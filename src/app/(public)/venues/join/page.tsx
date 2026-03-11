"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home as HomeIcon,
  MapPin,
  Sparkles,
  ShieldCheck,
  BarChart3,
  CheckCircle,
  Rocket,
  Landmark,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const highlights = [
  {
    icon: MapPin,
    title: "Targeted Exposure",
    desc: "Reach high-intent planners searching in your city",
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    desc: "Track views, saves, and inquiries to optimize listings",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Verification",
    desc: "Verified profiles, reviews, and secure messaging",
  },
  {
    icon: Landmark,
    title: "Premium Positioning",
    desc: "Get featured in curated venue spotlights",
  },
];

const steps = [
  "Add venue details, photos, and capacity",
  "Set pricing, availability, and amenities",
  "Approve inquiries and confirm bookings",
  "Delight guests and grow reputation",
];

export default function JoinVenues() {
  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-[#C6A14A]/30 text-[#C6A14A] text-sm mb-4">
                <Sparkles size={16} />
                List with Riwaazo
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif text-white mb-4">
                Showcase Your <span className="text-[#C6A14A]">Venue</span> to the Right Guests
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join our curated marketplace to attract premium events with verified inquiries and transparent bookings.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/signup?role=venue-owner"
                  className="px-8 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  List your venue
                </Link>
                <Link
                  href="/venues"
                  className="px-8 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
                >
                  Browse venues
                </Link>
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-6 rounded-xl bg-gradient-to-br from-[#6A0000] to-[#4A0000] border border-[#C6A14A]/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C6A14A]/15 flex items-center justify-center">
                        <Icon className="text-[#C6A14A]" size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-gray-300 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-8 border border-[#C6A14A]/20 mb-12"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-serif text-white mb-2">
                    Start listing in minutes
                  </h2>
                  <p className="text-gray-300">
                    Provide essential details, set availability, and open your doors to premium events.
                  </p>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps.map((step, idx) => (
                    <div
                      key={step}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 flex gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C6A14A]/20 text-[#C6A14A] font-semibold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <p className="text-white text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Assurance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-8 border border-[#C6A14A]/20"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] text-xs mb-3">
                    <ShieldCheck size={14} /> Trusted network
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3">Confidence for every booking</h3>
                  <p className="text-gray-300 mb-4">
                    Verified listings, authentic reviews, and secure communications keep your venue protected and in demand.
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-200">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <HomeIcon size={14} className="text-[#C6A14A]" /> Feature placements
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <Rocket size={14} className="text-[#C6A14A]" /> Quick onboarding
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <CheckCircle size={14} className="text-[#C6A14A]" /> Dedicated support
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-[#C6A14A]/5 border border-[#C6A14A]/20 rounded-lg p-6 w-full">
                  <h4 className="text-lg font-semibold text-white mb-3">Ready to list?</h4>
                  <p className="text-gray-300 mb-4 text-sm">
                    Highlight your spaces, set your terms, and start receiving high-quality inquiries.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/auth/signup?role=venue-owner"
                      className="flex-1 px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors text-center"
                    >
                      Get started
                    </Link>
                    <Link
                      href="/venues"
                      className="flex-1 px-6 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors text-center"
                    >
                      Browse venues
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
