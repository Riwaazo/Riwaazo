"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Search, Loader2, MapPin, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type Event = {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  status: string;
  budget?: number | null;
  venue?: { id: string; name: string; location?: string | null } | null;
  organizer?: { name?: string | null; email?: string | null } | null;
};

const statusColors: Record<string, string> = {
  DRAFT: "border-gray-500/30 text-gray-300 bg-gray-500/10",
  PUBLISHED: "border-blue-500/30 text-blue-300 bg-blue-500/10",
  CONFIRMED: "border-green-500/30 text-green-300 bg-green-500/10",
  COMPLETED: "border-[#C6A14A]/30 text-[#C6A14A] bg-[#C6A14A]/10",
  CANCELLED: "border-red-500/30 text-red-300 bg-red-500/10",
};

export default function DashboardEvents() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace("/auth/login"); return; }
    })();
  }, [router, supabase]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.title.toLowerCase().includes(q) || e.venue?.name?.toLowerCase().includes(q) || e.venue?.location?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  const statuses = useMemo(() => {
    const set = new Set(events.map((e) => e.status));
    return ["all", ...Array.from(set)];
  }, [events]);

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000] text-white">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-300 flex items-center gap-1">
                  <Link href="/dashboard" className="hover:text-[#C6A14A]">Dashboard</Link>
                  <span>/</span> Events
                </p>
                <h1 className="text-3xl font-serif">Your Events</h1>
                <p className="text-gray-400 text-sm mt-1">{events.length} total events</p>
              </div>
              <Link
                href="/planner"
                className="px-4 py-2.5 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2 w-fit"
              >
                <Plus size={16} /> Plan new event
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C6A14A]/50"
                  placeholder="Search events, venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-[#2A0000]">
                    {s === "all" ? "All statuses" : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#C6A14A]" size={32} />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Calendar size={48} className="mx-auto text-gray-600" />
                <p className="text-gray-400">{events.length === 0 ? "No events yet. Start planning your first event!" : "No events match your filters."}</p>
                <Link href="/planner" className="inline-block px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors">
                  Plan your first event
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#C6A14A]/40 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold group-hover:text-[#C6A14A] transition-colors">{event.title}</h3>
                        {event.description && <p className="text-sm text-gray-400 line-clamp-1">{event.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} /> {event.venue.name}{event.venue.location ? ` · ${event.venue.location}` : ""}
                            </span>
                          )}
                          {event.date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} /> {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                          {event.budget && (
                            <span className="flex items-center gap-1">
                              <Users size={14} /> Budget: ₹{event.budget.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${statusColors[event.status] ?? "border-white/20 text-gray-200"}`}>
                        {event.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </SwipeTransition>
  );
}
