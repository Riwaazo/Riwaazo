"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Calendar, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type BookingSlot = {
  id: string;
  eventDate: string;
  status: string;
  guestCount?: number | null;
  notes?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
  venue?: { name?: string | null } | null;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
  CONFIRMED: "bg-green-500/20 border-green-500/40 text-green-300",
  CANCELLED: "bg-red-500/20 border-red-500/40 text-red-300",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function VenueCalendar() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const role = (data.user?.user_metadata?.role as string)?.toUpperCase();
      if (!data.user || (role !== "VENUE" && role !== "ADMIN")) {
        router.replace("/dashboard");
        return;
      }
    })();
  }, [router, supabase]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load bookings");
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingSlot[]> = {};
    bookings.forEach((b) => {
      const key = new Date(b.eventDate).toISOString().split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const cells = useMemo(() => {
    const result: Array<{ day: number | null; dateStr: string }> = [];
    for (let i = 0; i < firstDay; i++) result.push({ day: null, dateStr: "" });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({ day: d, dateStr });
    }
    return result;
  }, [year, mo, firstDay, daysInMonth]);

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];
  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => setMonth(new Date(year, mo - 1, 1));
  const nextMonth = () => setMonth(new Date(year, mo + 1, 1));

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/venue/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C6A14A] mb-2">
                  <ArrowLeft size={14} /> Back to dashboard
                </Link>
                <h1 className="text-3xl font-serif">Venue Calendar</h1>
                <p className="text-gray-400 text-sm mt-1">{bookings.filter((b) => b.status === "CONFIRMED").length} confirmed bookings this period</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#C6A14A]" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
                {/* Calendar grid */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} /></button>
                    <h2 className="text-xl font-semibold">
                      {month.toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10"><ChevronRight size={20} /></button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map((d) => (
                      <div key={d} className="text-center text-xs text-gray-500 py-2 font-medium">{d}</div>
                    ))}
                    {cells.map((cell, i) => {
                      if (!cell.day) return <div key={i} />;
                      const dayBookings = bookingsByDate[cell.dateStr] || [];
                      const hasConfirmed = dayBookings.some((b) => b.status === "CONFIRMED");
                      const hasPending = dayBookings.some((b) => b.status === "PENDING");
                      const isToday = cell.dateStr === today;
                      const isSelected = cell.dateStr === selectedDate;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`relative p-2 rounded-lg text-sm transition-colors min-h-[60px] flex flex-col items-center gap-1 ${
                            isSelected ? "bg-[#C6A14A]/20 border border-[#C6A14A]" :
                            isToday ? "bg-white/10 border border-white/20" :
                            "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <span className={isToday ? "text-[#C6A14A] font-bold" : "text-gray-300"}>{cell.day}</span>
                          <div className="flex gap-1">
                            {hasConfirmed && <div className="w-2 h-2 rounded-full bg-green-400" />}
                            {hasPending && <div className="w-2 h-2 rounded-full bg-yellow-400" />}
                          </div>
                          {dayBookings.length > 0 && (
                            <span className="text-[10px] text-gray-500">{dayBookings.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> Confirmed</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Pending</span>
                  </div>
                </div>

                {/* Sidebar: selected day bookings */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#C6A14A]" />
                    <h3 className="text-white font-semibold">
                      {selectedDate
                        ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
                        : "Select a date"}
                    </h3>
                  </div>

                  {!selectedDate ? (
                    <p className="text-sm text-gray-500">Click on a date to see bookings for that day.</p>
                  ) : selectedBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar size={32} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500">No bookings on this date.</p>
                      <p className="text-xs text-gray-600 mt-1">This date is available for new bookings.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedBookings.map((b) => (
                        <div key={b.id} className={`p-3 rounded-lg border ${statusColors[b.status] ?? "border-white/10 bg-white/5"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium text-sm">
                              {b.user?.name || b.user?.email || "Guest"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 bg-white/5">
                              {b.status}
                            </span>
                          </div>
                          {b.venue?.name && <p className="text-xs text-gray-400">{b.venue.name}</p>}
                          {b.guestCount && <p className="text-xs text-gray-400">{b.guestCount} guests</p>}
                          {b.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10">
                    <h4 className="text-sm text-gray-400 mb-2">Quick stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-lg font-semibold text-white">{bookings.filter((b) => b.status === "CONFIRMED").length}</p>
                        <p className="text-xs text-gray-500">Confirmed</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-lg font-semibold text-white">{bookings.filter((b) => b.status === "PENDING").length}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </SwipeTransition>
  );
}
