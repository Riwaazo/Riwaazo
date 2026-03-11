"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#5A0000] via-[#4A0000] to-[#3a0000] overflow-hidden">
      {/* Pattern + blur overlay for glass effect */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#6A0000]/20 via-[#4A0000]/45 to-[#3a0000]/50 backdrop-blur-3xl"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23C6A14A%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Image
            src="/logo.png"
            alt="Riwaazo Logo"
            width={120}
            height={120}
            className="rounded-full shadow-2xl shadow-[#C6A14A]/30"
            priority
          />
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white mb-4 tracking-wide">
            Where Celebrations <span className="text-[#C6A14A]">Begin</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Discover premium venues, verified vendors, and seamless event planning — all in one place.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Link
            href="/venues"
            className="px-8 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Explore Venues
          </Link>
          <Link
            href="/planner"
            className="px-8 py-3 border-2 border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors text-center"
          >
            Plan Your Event
          </Link>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-4xl bg-white/20 backdrop-blur-2xl border-2 border-white/30 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-[#C6A14A]/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <label className="text-xs text-gray-300 mb-2 block">Location</label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                <MapPin size={18} className="text-[#C6A14A]" />
                <input
                  type="text"
                  placeholder="City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="relative">
              <label className="text-xs text-gray-300 mb-2 block">Event Type</label>
              <select
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
              <label className="text-xs text-gray-300 mb-2 block">Date</label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                <Calendar size={18} className="text-[#C6A14A]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-white outline-none flex-1"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="relative">
              <label className="text-xs text-gray-300 mb-2 block">Guests</label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                <Users size={18} className="text-[#C6A14A]" />
                <input
                  type="number"
                  placeholder="Count"
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
            className="w-full mt-4 inline-flex items-center justify-center bg-[#C6A14A] text-black font-semibold py-2 rounded-lg hover:bg-[#E8C56B] transition-colors"
          >
            Search Events
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
