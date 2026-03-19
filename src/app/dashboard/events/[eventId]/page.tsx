"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type EventDetail = {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  status: string;
  budget?: number | null;
  venue?: { id: string; name: string; location?: string | null; slug?: string } | null;
  organizer?: { name?: string | null; email?: string | null } | null;
  eventPlanner?: { id: string; companyName: string } | null;
};

const statusColors: Record<string, string> = {
  DRAFT: "border-gray-500/30 text-gray-300 bg-gray-500/10",
  PUBLISHED: "border-blue-500/30 text-blue-300 bg-blue-500/10",
  CONFIRMED: "border-green-500/30 text-green-300 bg-green-500/10",
  COMPLETED: "border-[#C6A14A]/30 text-[#C6A14A] bg-[#C6A14A]/10",
  CANCELLED: "border-red-500/30 text-red-300 bg-red-500/10",
};
const allStatuses = ["DRAFT", "PUBLISHED", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function DashboardEventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace("/auth/login"); return; }
    })();
  }, [router, supabase]);

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        const found = (Array.isArray(data) ? data : []).find((e: EventDetail) => e.id === eventId);
        if (!found) throw new Error("Event not found");
        setEvent(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!event) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: event.id, status: newStatus }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to update status");
      }
      setEvent((prev) => prev ? { ...prev, status: newStatus } : prev);
      setUpdateMsg({ ok: true, msg: `Status updated to ${newStatus}` });
    } catch (err) {
      setUpdateMsg({ ok: false, msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000] text-white">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-[#C6A14A]">
              <ArrowLeft size={14} /> Back to events
            </Link>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#C6A14A]" size={32} />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">{error}</div>
            ) : event ? (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif">{event.title}</h1>
                    {event.description && <p className="text-gray-400 mt-1">{event.description}</p>}
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${statusColors[event.status] ?? "border-white/20 text-gray-200"}`}>
                    {event.status}
                  </span>
                </div>

                {updateMsg && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${updateMsg.ok ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                    {updateMsg.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {updateMsg.msg}
                  </div>
                )}

                {/* Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#C6A14A]" />
                      <p className="text-white font-medium">
                        {event.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Venue</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#C6A14A]" />
                      <p className="text-white font-medium">{event.venue?.name || "Not assigned"}</p>
                    </div>
                    {event.venue?.location && <p className="text-xs text-gray-400 ml-6">{event.venue.location}</p>}
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Budget</p>
                    <p className="text-white font-medium text-lg">{event.budget ? `₹${event.budget.toLocaleString("en-IN")}` : "Not set"}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Organizer</p>
                    <p className="text-white font-medium">{event.organizer?.name || "You"}</p>
                    {event.organizer?.email && <p className="text-xs text-gray-400">{event.organizer.email}</p>}
                  </div>
                </div>

                {/* Event planner */}
                {event.eventPlanner && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Event Planner</p>
                    <p className="text-white font-medium">{event.eventPlanner.companyName}</p>
                  </div>
                )}

                {/* Status actions */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                  <h3 className="text-white font-semibold">Update status</h3>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(s)}
                        disabled={updating || s === event.status}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors disabled:opacity-40 ${
                          s === event.status
                            ? "border-[#C6A14A] bg-[#C6A14A]/20 text-[#C6A14A]"
                            : "border-white/15 text-gray-300 hover:border-white/30 hover:bg-white/5"
                        }`}
                      >
                        {updating && s !== event.status ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick links */}
                <div className="flex flex-wrap gap-3">
                  {event.venue && (
                    <Link
                      href={`/venues/${event.venue.id}`}
                      className="px-4 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg text-sm border border-[#C6A14A]/30 hover:bg-[#C6A14A]/25"
                    >
                      View venue
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 border border-white/15 text-white rounded-lg text-sm hover:bg-white/10"
                  >
                    Back to dashboard
                  </Link>
                  <Link
                    href="/budget"
                    className="px-4 py-2 border border-white/15 text-white rounded-lg text-sm hover:bg-white/10"
                  >
                    Budget calculator
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <Footer />
      </div>
    </SwipeTransition>
  );
}
