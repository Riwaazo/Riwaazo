"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Send, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const drafts = [
  { id: "A-12", title: "Marketplace maintenance", status: "Draft", audience: "Vendors", updated: "Today" },
  { id: "A-11", title: "New venue badges", status: "Scheduled", audience: "Venues", updated: "Yesterday" },
];

export default function AdminAnnouncements() {
  const [form, setForm] = useState({ title: "", audience: "All", body: "" });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Link href="/admin" className="hover:text-[#C6A14A] flex items-center gap-1">
                <ArrowLeft size={14} /> Back to admin
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-400">Broadcast updates</p>
                <h1 className="text-3xl font-serif text-white">Announcements</h1>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2">
                  <Plus size={16} /> New draft
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4">
                <h3 className="text-white font-semibold">Create announcement</h3>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                <div className="flex gap-3 flex-wrap text-sm">
                  <label className="text-gray-300">Audience</label>
                  <select
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    value={form.audience}
                    onChange={(e) => handleChange("audience", e.target.value)}
                  >
                    {["All", "Vendors", "Venues", "Planners", "Admins"].map((aud) => (
                      <option key={aud} value={aud} className="bg-[#0B0B14]">
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                  placeholder="Write the announcement..."
                  value={form.body}
                  onChange={(e) => handleChange("body", e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2">
                    <Send size={16} /> Publish
                  </button>
                  <button className="px-4 py-2 border border-white/15 text-white rounded-lg hover:bg-white/10 transition-colors">Save draft</button>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#2A1A1A] to-[#1B1222] border border-[#C6A14A]/15 space-y-3">
                <h3 className="text-white font-semibold">Drafts & scheduled</h3>
                <div className="space-y-3 text-sm">
                  {drafts.map((d) => (
                    <div key={d.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">{d.id}</span>
                        <span className="text-xs text-gray-300">{d.status}</span>
                      </div>
                      <p className="text-white font-semibold mt-1">{d.title}</p>
                      <p className="text-gray-400 text-xs">{d.audience} · {d.updated}</p>
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 bg-white/10 text-white rounded-lg border border-white/15 text-xs">Edit</button>
                        <button className="px-3 py-1 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30 text-xs">Schedule</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
