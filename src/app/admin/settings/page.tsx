"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Bell, Globe2, Save, ArrowLeft } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function AdminSettings() {
  const [toggles, setToggles] = useState({ kyc: true, alerts: true, maintenance: false });
  const [locale, setLocale] = useState("en-IN");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const toggle = (key: keyof typeof toggles) => setToggles((p) => ({ ...p, [key]: !p[key] }));

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Link href="/admin" className="hover:text-[#C6A14A] flex items-center gap-1">
                <ArrowLeft size={14} /> Back to admin
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-400">Platform controls</p>
                <h1 className="text-3xl font-serif text-white">Settings</h1>
              </div>
              <button className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2">
                <Save size={16} /> Save changes
              </button>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Security & compliance</h3>
                    <p className="text-gray-400 text-sm">Controls for vendor onboarding and KYC</p>
                  </div>
                  <ShieldCheck className="text-[#C6A14A]" />
                </div>
                <div className="space-y-3 text-sm text-gray-200">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={toggles.kyc} onChange={() => toggle("kyc")} className="accent-[#C6A14A]" />
                    Enforce KYC on new vendors
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={toggles.maintenance} onChange={() => toggle("maintenance")} className="accent-[#C6A14A]" />
                    Maintenance mode banner
                  </label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#2A1A1A] to-[#1B1222] border border-[#C6A14A]/15 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <p className="text-gray-400 text-sm">System and escalation alerts</p>
                  </div>
                  <Bell className="text-[#C6A14A]" />
                </div>
                <div className="space-y-3 text-sm text-gray-200">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={toggles.alerts} onChange={() => toggle("alerts")} className="accent-[#C6A14A]" />
                    Send email alerts to admins
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="accent-[#C6A14A]" />
                    Send SMS for escalations
                  </label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Localization</h3>
                    <p className="text-gray-400 text-sm">Locale and timezone defaults</p>
                  </div>
                  <Globe2 className="text-[#C6A14A]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-200">
                  <div className="space-y-2">
                    <label className="text-gray-300">Default locale</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                    >
                      {["en-IN", "en-US", "hi-IN"].map((loc) => (
                        <option key={loc} value={loc} className="bg-[#0B0B14]">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-300">Default timezone</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {["Asia/Kolkata", "UTC", "Asia/Dubai"].map((tz) => (
                        <option key={tz} value={tz} className="bg-[#0B0B14]">
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
