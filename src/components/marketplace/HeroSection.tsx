"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type HeroSectionProps = {
  stats?: {
    venues: number;
    vendors: number;
    cities: number;
  };
};

export default function HeroSection({ stats }: Readonly<HeroSectionProps>) {
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-gradient-to-br from-[#5A0000] via-[#4A0000] to-[#3a0000]">
      {/* Pattern + blur overlay for glass effect */}
      <div className="hero-pattern absolute inset-0 bg-gradient-to-br from-[#6A0000]/20 via-[#4A0000]/45 to-[#3a0000]/50 backdrop-blur-3xl" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-start px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:justify-center lg:pt-24">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6 sm:mb-8"
        >
          <Image
            src="/logo.png"
            alt="Riwaazo Logo"
            width={120}
            height={120}
            className="h-20 w-20 rounded-full shadow-2xl shadow-[#C6A14A]/30 sm:h-24 sm:w-24 lg:h-[120px] lg:w-[120px]"
            priority
          />
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 text-center sm:mb-10 lg:mb-12"
        >
          <h1 className="mb-4 text-4xl font-serif tracking-wide text-white sm:text-5xl lg:text-7xl">
            Where Celebrations <span className="text-[#C6A14A]">Begin</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base font-light text-gray-300 sm:text-lg lg:text-xl">
            Discover premium venues, verified vendors, and seamless event planning — all in one place.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 flex w-full max-w-md flex-col gap-3 sm:mb-8 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        >
          <Link
            href="/venues"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C6A14A] px-6 py-3 text-center font-semibold text-black transition-colors hover:bg-[#E8C56B] sm:w-auto sm:px-8"
          >
            <Sparkles size={18} />
            Explore Venues
          </Link>
          <Link
            href="/planner"
            className="w-full rounded-lg border-2 border-[#C6A14A] px-6 py-3 text-center font-semibold text-[#C6A14A] transition-colors hover:bg-[#C6A14A]/10 sm:w-auto sm:px-8"
          >
            Plan Your Event
          </Link>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8 grid w-full max-w-md grid-cols-1 gap-3 sm:mb-10 sm:max-w-3xl sm:grid-cols-3"
          >
            {[
              { label: "Approved venues", value: stats.venues },
              { label: "Verified vendors", value: stats.vendors },
              { label: "Active cities", value: Math.max(stats.cities, 1) },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/15 bg-white/8 px-3 py-4 text-center backdrop-blur-md">
                <div className="text-2xl font-semibold text-white sm:text-3xl">{item.value}+</div>
                <div className="mt-1 text-xs text-gray-300 sm:text-sm">{item.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-5xl rounded-2xl border-2 border-white/30 bg-white/20 p-4 shadow-2xl shadow-[#C6A14A]/10 backdrop-blur-2xl sm:p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <label htmlFor="hero-location" className="text-xs text-gray-300 mb-2 block">Location</label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                <MapPin size={18} className="text-[#C6A14A]" />
                <input
                  type="text"
                  id="hero-location"
                  placeholder="City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="relative">
              <label htmlFor="hero-event-type" className="text-xs text-gray-300 mb-2 block">Event Type</label>
              <select
                id="hero-event-type"
                title="Select event type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 outline-none cursor-pointer border border-white/20"
              >
                <option value="" className="bg-black">
                  Select type
                </option>
                <option value="wedding" className="bg-black">
                  Wedding
                </option>
                <option value="corporate" className="bg-black">
                  Corporate
                </option>
                <option value="birthday" className="bg-black">
                  Birthday
                </option>
                <option value="other" className="bg-black">
                  Other
                </option>
              </select>
            </div>

            {/* Date */}
            <div className="relative">
              <label htmlFor="hero-date" className="text-xs text-gray-300 mb-2 block">Date</label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                <Calendar size={18} className="text-[#C6A14A]" />
                <input
                  type="date"
                  id="hero-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-white outline-none flex-1"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="relative">
              <label htmlFor="hero-guests" className="text-xs text-gray-300 mb-2 block">Guests</label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                <Users size={18} className="text-[#C6A14A]" />
                <input
                  type="number"
                  id="hero-guests"
                  placeholder="Count"
                  title="Enter guest count"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <Link
            href="/venues"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#C6A14A] py-3 font-semibold text-black transition-colors hover:bg-[#E8C56B]"
          >
            Search Events
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
