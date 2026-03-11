"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Star,
  Rocket,
  CheckCircle,
  Handshake,
  Megaphone,
  BarChart3,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const benefits = [
  {
    icon: Handshake,
    title: "Verified Leads",
    desc: "Connect with couples and planners ready to book",
  },
  {
    icon: Megaphone,
    title: "Premium Visibility",
    desc: "Get featured in curated collections and spotlights",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Verified profiles, reviews, and secure inquiries",
  },
  {
    icon: BarChart3,
    title: "Performance Insights",
    desc: "Track views, inquiries, and conversion in one place",
  },
];

const steps = [
  "Create your vendor profile",
  "Showcase work, pricing, and availability",
  "Get matched with the right events",
  "Confirm bookings and grow revenue",
];

export default function JoinVendors() {
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
                Partner with Riwaazo
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif text-white mb-4">
                Grow Your Business with <span className="text-[#C6A14A]">Verified Clients</span>
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join our trusted marketplace to showcase your work, respond to qualified leads, and secure more bookings.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/signup?role=vendor"
                  className="px-8 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  Sign up as Vendor
                </Link>
                <Link
                  href="/vendors"
                  className="px-8 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
                >
                  View marketplace
                </Link>
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="p-6 rounded-xl bg-gradient-to-br from-[#6A0000] to-[#4A0000] border border-[#C6A14A]/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C6A14A]/15 flex items-center justify-center">
                        <Icon className="text-[#C6A14A]" size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                        <p className="text-gray-300 text-sm">{benefit.desc}</p>
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
                    Join in Minutes
                  </h2>
                  <p className="text-gray-300">
                    Create a rich profile, showcase your portfolio, and start receiving curated leads.
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
                    <ShieldCheck size={14} /> Verified community
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3">Built for trusted pros</h3>
                  <p className="text-gray-300 mb-4">
                    We vet listings, surface reviews, and keep your conversations secure so you can focus on delivering great experiences.
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-200">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <Star size={14} className="text-[#C6A14A]" /> Spotlight placements
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <Rocket size={14} className="text-[#C6A14A]" /> Fast onboarding
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <CheckCircle size={14} className="text-[#C6A14A]" /> Dedicated support
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-[#C6A14A]/5 border border-[#C6A14A]/20 rounded-lg p-6 w-full">
                  <h4 className="text-lg font-semibold text-white mb-3">Ready to join?</h4>
                  <p className="text-gray-300 mb-4 text-sm">
                    Create your vendor profile, upload your portfolio, and start receiving high-intent leads.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/auth/signup?role=vendor"
                      className="flex-1 px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors text-center"
                    >
                      Get started
                    </Link>
                    <Link
                      href="/vendors"
                      className="flex-1 px-6 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors text-center"
                    >
                      Explore vendors
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
