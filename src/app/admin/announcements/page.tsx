"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type SentItem = { title: string; audience: string; sent: number; ts: string };

export default function AdminAnnouncements() {
  const [form, setForm] = useState({ title: "", audience: "All", body: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [history, setHistory] = useState<SentItem[]>([]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePublish = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setResult({ ok: false, msg: "Title and message are required" });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: form.title, message: form.body, audience: form.audience }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send");
      setResult({ ok: true, msg: `Sent to ${data.sent} ${form.audience.toLowerCase()} users` });
      setHistory((prev) => [
        { title: form.title, audience: form.audience, sent: data.sent, ts: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      setForm({ title: "", audience: "All", body: "" });
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed to send" });
    } finally {
      setSending(false);
    }
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
                <p className="text-gray-400 text-sm mt-1">Send notifications to all users or specific audience groups.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Compose */}
              <div className="lg:col-span-2 p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4">
                <h3 className="text-white font-semibold text-lg">Compose announcement</h3>

                {result && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${result.ok ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                    {result.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {result.msg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Title</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C6A14A]/50"
                    placeholder="e.g. Platform maintenance on March 20"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Target audience</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C6A14A]/50"
                    value={form.audience}
                    onChange={(e) => handleChange("audience", e.target.value)}
                  >
                    {["All", "Vendors", "Venues", "Planners", "Admins"].map((aud) => (
                      <option key={aud} value={aud} className="bg-[#0B0B14]">
                        {aud === "All" ? "All users" : aud}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-300">Message</label>
                  <textarea
                    className="w-full h-36 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C6A14A]/50 resize-none"
                    placeholder="Write the announcement body..."
                    value={form.body}
                    onChange={(e) => handleChange("body", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handlePublish}
                    disabled={sending}
                    className="px-5 py-2.5 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {sending ? "Sending…" : "Publish now"}
                  </button>
                  <span className="text-xs text-gray-500">This creates a notification for every user in the audience.</span>
                </div>
              </div>

              {/* Sent history */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#2A1A1A] to-[#1B1222] border border-[#C6A14A]/15 space-y-3">
                <h3 className="text-white font-semibold">Sent this session</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">No announcements sent yet. Compose one on the left to get started.</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    {history.map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/30">Sent</span>
                          <span className="text-xs text-gray-400">{item.ts}</span>
                        </div>
                        <p className="text-white font-semibold mt-1">{item.title}</p>
                        <p className="text-gray-400 text-xs">{item.audience} · {item.sent} recipients</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm text-gray-300 font-medium mb-2">Audience guide</h4>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p><span className="text-gray-300">All</span> — Every registered user</p>
                    <p><span className="text-gray-300">Vendors</span> — Service providers</p>
                    <p><span className="text-gray-300">Venues</span> — Venue owners</p>
                    <p><span className="text-gray-300">Planners</span> — Event planners</p>
                    <p><span className="text-gray-300">Admins</span> — Platform admins</p>
                  </div>
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
