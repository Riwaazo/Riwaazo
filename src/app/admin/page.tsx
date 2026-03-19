"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Home as HomeIcon, ClipboardList, XCircle, Search, Filter, Settings, LineChart, MessageSquare, Send, Paperclip, Image as ImageIcon, Link2, X, Bell } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type Vendor = {
  id: string;
  companyName?: string;
  services?: string;
  user?: { name?: string | null; email?: string | null };
  venues?: Array<{ id: string; name: string; location?: string | null; capacity?: number | null }>;
  createdAt?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

type Venue = {
  id: string;
  name: string;
  location?: string | null;
  capacity?: number | null;
  priceRange?: string | null;
  vendor?: { companyName?: string | null } | null;
  owner?: { name?: string | null; email?: string | null } | null;
  createdAt?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

type Booking = {
  id: string;
  status: string;
  eventDate: string;
  guestCount?: number | null;
  notes?: string | null;
  createdAt?: string;
  venue?: { id: string; name: string; location?: string | null } | null;
  vendor?: { id: string; companyName?: string | null } | null;
  user?: { id: string; name?: string | null; email?: string | null } | null;
};

type Planner = {
  id: string;
  companyName?: string;
  services?: string;
  user?: { name?: string | null; email?: string | null };
  events?: Array<{ id: string; title: string; date: string | null; status: string | null }>;
  createdAt?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

type UserRow = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  createdAt?: string;
};

type AdminNotification = {
  id: string;
  title: string;
  category?: string | null;
  read: boolean;
  createdAt?: string;
};

export default function AdminPanel() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [vendorDecisions, setVendorDecisions] = useState<Record<string, "approved" | "rejected" | "viewed">>({});
  const [venueDecisions, setVenueDecisions] = useState<Record<string, "approved" | "rejected" | "viewed">>({});
  const [bookingDecisions, setBookingDecisions] = useState<Record<string, "resolved" | "viewed" | "escalated">>({});
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [threadMessages, setThreadMessages] = useState<Record<string, any[]>>({});
  const [threadLoading, setThreadLoading] = useState<Record<string, boolean>>({});
  const [threadError, setThreadError] = useState<Record<string, string | null>>({});
  const [threadInput, setThreadInput] = useState<Record<string, string>>({});
  const contentQueue: any[] = [];

  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.read), [notifications]);

  const markNotificationRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch { /* ignore */ }
  };

  const [tab, setTab] = useState<"overview" | "vendors" | "venues" | "planners" | "users" | "bookings" | "content">("overview");
  const [filters, setFilters] = useState({ status: "all", city: "all", search: "" });
  const statusOptions = ["all", "PENDING", "APPROVED", "REJECTED"];
  const cityOptions = useMemo(() => {
    const locations = new Set<string>();
    venues.forEach((v) => v.location && locations.add(v.location));
    return ["all", ...Array.from(locations)];
  }, [venues]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/admin/check", { credentials: "include", cache: "no-store" });
      if (!active) return;
      if (res.ok) {
        setAuthChecked(true);
        return;
      }
      const detail = await res.json().catch(() => ({}));
      setAuthError(detail?.error || "Admin access required");
      router.replace("/auth/admin");
    })();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    let active = true;
    (async () => {
      setLoadingData(true);
      setLoadError(null);
      try {
        const [vendorsRes, venuesRes, bookingsRes, plannersRes, usersRes, notificationsRes] = await Promise.all([
          fetch("/api/vendors", { credentials: "include", cache: "no-store" }),
          fetch("/api/venues", { credentials: "include", cache: "no-store" }),
          fetch("/api/bookings", { credentials: "include", cache: "no-store" }),
          fetch("/api/event-planners", { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/users", { credentials: "include", cache: "no-store" }),
          fetch("/api/notifications", { credentials: "include", cache: "no-store" }),
        ]);

        if (!vendorsRes.ok) throw new Error((await vendorsRes.json().catch(() => ({}))).error || "Failed to load vendors");
        if (!venuesRes.ok) throw new Error((await venuesRes.json().catch(() => ({}))).error || "Failed to load venues");
        if (!bookingsRes.ok) throw new Error((await bookingsRes.json().catch(() => ({}))).error || "Failed to load bookings");
        if (!plannersRes.ok) throw new Error((await plannersRes.json().catch(() => ({}))).error || "Failed to load planners");
        if (!usersRes.ok) throw new Error((await usersRes.json().catch(() => ({}))).error || "Failed to load users");

        const [vendorsJson, venuesJson, bookingsJson, plannersJson, usersJson] = await Promise.all([
          vendorsRes.json(),
          venuesRes.json(),
          bookingsRes.json(),
          plannersRes.json(),
          usersRes.json(),
        ]);
        if (!active) return;
        setVendors(Array.isArray(vendorsJson) ? vendorsJson : []);
        setVenues(Array.isArray(venuesJson) ? venuesJson : []);
        setBookings(Array.isArray(bookingsJson) ? bookingsJson : []);
        setPlanners(Array.isArray(plannersJson) ? plannersJson : []);
        setUsers(Array.isArray(usersJson) ? usersJson : []);
        const notificationsJson = notificationsRes.ok ? await notificationsRes.json() : [];
        setNotifications(Array.isArray(notificationsJson) ? notificationsJson : []);
      } catch (err) {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authChecked]);

  const vendorCards = useMemo(() => {
    return vendors.map((v) => {
      const firstVenue = v.venues?.[0];
      return {
        ...v,
        displayName: v.companyName || v.user?.name || "Vendor",
        servicesText: v.services || "Services pending",
        location: firstVenue?.location || "Not set",
        venueCount: v.venues?.length ?? 0,
        searchText: `${v.companyName || ""} ${v.services || ""} ${firstVenue?.location || ""}`.toLowerCase(),
        status: v.status || "PENDING",
      };
    });
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const query = filters.search.toLowerCase();
    return vendorCards.filter((v) => {
      const matchSearch = !query || v.searchText?.includes(query) || v.displayName.toLowerCase().includes(query);
      const statusValue = v.status || "PENDING";
      const matchStatus = filters.status === "all" ? true : statusValue === filters.status.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [vendorCards, filters.search, filters.status]);

  const filteredVenues = useMemo(() => {
    const query = filters.search.toLowerCase();
    return venues.filter((v) => {
      const matchCity = filters.city === "all" || v.location === filters.city;
      const matchSearch =
        !query ||
        v.name.toLowerCase().includes(query) ||
        (v.location || "").toLowerCase().includes(query) ||
        (v.vendor?.companyName || "").toLowerCase().includes(query);
      const statusValue = v.status || "PENDING";
      const matchStatus = filters.status === "all" ? true : statusValue === filters.status.toUpperCase();
      return matchCity && matchSearch && matchStatus;
    });
  }, [venues, filters.city, filters.search, filters.status]);

  const plannerCards = useMemo(() => {
    return planners.map((p) => ({
      ...p,
      displayName: p.companyName || p.user?.name || "Planner",
      servicesText: p.services || "Services pending",
      eventCount: p.events?.length ?? 0,
      searchText: `${p.companyName || ""} ${p.services || ""}`.toLowerCase(),
      status: p.status || "PENDING",
    }));
  }, [planners]);

  const filteredPlanners = useMemo(() => {
    const query = filters.search.toLowerCase();
    return plannerCards.filter((p) => {
      const matchSearch = !query || p.searchText?.includes(query) || p.displayName.toLowerCase().includes(query);
      const statusValue = p.status || "PENDING";
      const matchStatus = filters.status === "all" ? statusValue === "PENDING" : statusValue === filters.status.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [plannerCards, filters.search, filters.status]);

  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "PENDING"), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === "CONFIRMED"), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === "CANCELLED"), [bookings]);
  const pendingVendors = useMemo(() => vendorCards.filter((v) => v.status === "PENDING"), [vendorCards]);
  const pendingVenues = useMemo(() => venues.filter((v) => (v.status || "PENDING") === "PENDING"), [venues]);
  const pendingPlanners = useMemo(() => plannerCards.filter((p) => p.status === "PENDING"), [plannerCards]);

  const handleVendorDecision = async (id: string, action: "approved" | "rejected" | "viewed") => {
    setVendorDecisions((prev) => ({ ...prev, [id]: action }));
    if (action === "viewed") return;
    const status = action === "approved" ? "APPROVED" : "REJECTED";
    const previous = vendors;
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update vendor status");
    } catch (e) {
      console.error(e);
      setLoadError((prev) => prev || "Could not update vendor status");
      setVendors(previous);
    }
  };

  const handleVenueDecision = async (id: string, action: "approved" | "rejected" | "viewed") => {
    setVenueDecisions((prev) => ({ ...prev, [id]: action }));
    if (action === "viewed") return;
    const status = action === "approved" ? "APPROVED" : "REJECTED";
    const previous = venues;
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    try {
      const res = await fetch("/api/admin/venues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update venue status");
    } catch (e) {
      console.error(e);
      setLoadError((prev) => prev || "Could not update venue status");
      setVenues(previous);
    }
  };

  const handleBookingDecision = async (id: string, action: "resolved" | "viewed" | "escalated") => {
    setBookingDecisions((prev) => ({ ...prev, [id]: action }));
    if (action === "viewed") return;
    const status = action === "resolved" ? "CONFIRMED" : "CANCELLED";
    const previous = bookings;
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update booking status");
    } catch (e) {
      console.error(e);
      setLoadError((prev) => prev || "Could not update booking status");
      setBookings(previous);
    }
  };

  const loadBookingThread = async (bookingId: string) => {
    setThreadLoading((p) => ({ ...p, [bookingId]: true }));
    setThreadError((p) => ({ ...p, [bookingId]: null }));
    try {
      const res = await fetch(`/api/bookings/messages?bookingId=${bookingId}`, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setThreadMessages((p) => ({ ...p, [bookingId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      setThreadError((p) => ({ ...p, [bookingId]: err instanceof Error ? err.message : "Error" }));
    } finally {
      setThreadLoading((p) => ({ ...p, [bookingId]: false }));
    }
  };

  const sendAdminMessage = async (bookingId: string) => {
    const content = (threadInput[bookingId] || "").trim();
    if (!content) return;
    setThreadLoading((p) => ({ ...p, [bookingId]: true }));
    setThreadError((p) => ({ ...p, [bookingId]: null }));
    try {
      const res = await fetch("/api/bookings/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId, content }),
      });
      if (!res.ok) throw new Error("Send failed");
      const saved = await res.json();
      setThreadMessages((p) => ({ ...p, [bookingId]: [...(p[bookingId] || []), saved] }));
      setThreadInput((p) => ({ ...p, [bookingId]: "" }));
    } catch (err) {
      setThreadError((p) => ({ ...p, [bookingId]: err instanceof Error ? err.message : "Send failed" }));
    } finally {
      setThreadLoading((p) => ({ ...p, [bookingId]: false }));
    }
  };

  const overviewCards = useMemo(
    () => [
      { title: "Pending vendors", value: pendingVendors.length.toString(), delta: `${vendorCards.length} total`, icon: Store },
      { title: "Pending venues", value: pendingVenues.length.toString(), delta: `${venues.length} total`, icon: HomeIcon },
      { title: "Pending planners", value: pendingPlanners.length.toString(), delta: `${plannerCards.length} total`, icon: ClipboardList },
      { title: "Pending bookings", value: pendingBookings.length.toString(), delta: `${confirmedBookings.length} confirmed`, icon: XCircle },
    ],
    [pendingVendors.length, vendorCards.length, pendingVenues.length, venues.length, pendingBookings.length, confirmedBookings.length, cancelledBookings.length, bookings.length]
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] flex items-center justify-center text-white">
        {authError || "Checking admin access…"}
      </div>
    );
  }

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm text-gray-400">Admin control center</p>
                <h1 className="text-3xl font-serif text-white">Riwaazo Admin Panel</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/announcements"
                  className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors"
                >
                  New announcement
                </Link>
                <Link
                  href="/admin/settings"
                  className="px-4 py-2 border border-white/15 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} /> Settings
                </Link>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {["overview", "vendors", "venues", "planners", "bookings", "content", "users"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item as typeof tab)}
                  className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all border ${
                    tab === item
                      ? "bg-[#C6A14A] text-black border-[#C6A14A]"
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center text-sm text-gray-200">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                <Search size={14} className="text-[#C6A14A]" />
                <input
                  className="bg-transparent focus:outline-none text-white placeholder:text-gray-400"
                  placeholder="Search vendors, venues, bookings"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                <Filter size={14} className="text-[#C6A14A]" />
                <select
                  className="bg-transparent text-white focus:outline-none"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s} className="bg-[#0B0B14]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                <HomeIcon size={14} className="text-[#C6A14A]" />
                <select
                  className="bg-transparent text-white focus:outline-none"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                >
                  {cityOptions.map((c) => (
                    <option key={c} value={c} className="bg-[#0B0B14]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadError && (
              <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm">
                {loadError}
              </div>
            )}
            {loadingData && !loadError && (
              <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-gray-200 text-sm">
                Loading latest admin data…
              </div>
            )}

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {overviewCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.title} className="p-5 rounded-xl bg-gradient-to-br from-[#2A1A1A] to-[#1B1222] border border-[#C6A14A]/15">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-gray-300">{card.title}</p>
                          <div className="w-9 h-9 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] flex items-center justify-center">
                            <Icon size={16} />
                          </div>
                        </div>
                        <p className="text-2xl font-semibold text-white">{card.value}</p>
                        <p className="text-xs text-[#C6A14A] mt-1">{card.delta}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#2A1A1A] to-[#1B1222] border border-[#C6A14A]/15 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Approvals queue</h3>
                      <span className="text-xs text-gray-300">Vendors & venues</span>
                    </div>
                    <div className="space-y-3">
                      {filteredVendors.slice(0, 2).map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white font-semibold">{v.displayName}</p>
                            <p className="text-gray-300 text-sm">{v.servicesText} · {v.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30 text-sm">
                              Approve
                            </button>
                            <button className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30 text-sm">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredVenues.slice(0, 1).map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                          <div>
                            <p className="text-white font-semibold">{v.name}</p>
                            <p className="text-gray-300 text-sm">{v.capacity ? `${v.capacity} capacity` : "Capacity pending"} · {v.location || "No location"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30 text-sm">
                              Approve
                            </button>
                            <button className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30 text-sm">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Ops signals</h3>
                      <LineChart size={18} className="text-[#C6A14A]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-xs">Avg approval time</p>
                        <p className="text-white text-xl font-semibold">3.2h</p>
                        <p className="text-green-300 text-xs">-18% vs last week</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-xs">Escalations</p>
                        <p className="text-white text-xl font-semibold">4</p>
                        <p className="text-red-300 text-xs">+1 today</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-xs">Pending KYC</p>
                        <p className="text-white text-xl font-semibold">9</p>
                        <p className="text-yellow-300 text-xs">Action needed</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-xs">Content drafts</p>
                        <p className="text-white text-xl font-semibold">6</p>
                        <p className="text-gray-300 text-xs">Awaiting review</p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-200">
                        <span>Approvals trend (7d)</span>
                        <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/30 text-xs">+12%</span>
                      </div>
                      <svg viewBox="0 0 240 90" className="w-full h-24">
                        <defs>
                          <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C6A14A" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#C6A14A" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        <path d="M0 70 L40 62 L80 55 L120 48 L160 42 L200 38 L240 34 L240 90 L0 90 Z" fill="url(#adminTrendFill)" />
                        <path d="M0 70 L40 62 L80 55 L120 48 L160 42 L200 38 L240 34" stroke="#C6A14A" strokeWidth="3" fill="none" strokeLinecap="round" />
                        {[0,40,80,120,160,200,240].map((x, idx) => (
                          <circle key={x} cx={x} cy={[70,62,55,48,42,38,34][idx]} r={4} fill="#C6A14A" />
                        ))}
                      </svg>
                      <div className="flex justify-between text-[11px] text-gray-400 px-1">
                        {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Notifications */}
              {unreadNotifications.length > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#2A1A1A] to-[#1B1222] border border-[#C6A14A]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-[#C6A14A]" />
                      <h3 className="text-white font-semibold">Notifications</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-[#C6A14A]/20 text-[#C6A14A]">
                        {unreadNotifications.length} new
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {unreadNotifications.slice(0, 10).map((n) => (
                      <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white line-clamp-2">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {n.category && <span className="capitalize">{n.category.toLowerCase()} · </span>}
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                          </p>
                        </div>
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="shrink-0 text-xs px-2 py-1 rounded-md border border-[#C6A14A]/40 text-[#C6A14A] hover:bg-[#C6A14A]/10"
                        >
                          Dismiss
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Vendors */}
            {tab === "vendors" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Vendor approvals</h3>
                  <span className="text-sm text-gray-300">{filteredVendors.length} in queue</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredVendors.map((v) => (
                    <div key={v.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">{v.id.slice(0, 8)}…</span>
                        <span className="text-xs text-gray-300">{v.services ? "Profile ready" : "Needs details"}</span>
                      </div>
                      <p className="text-white font-semibold">{v.displayName}</p>
                      <p className="text-gray-300 text-sm">{v.servicesText} · {v.location}</p>
                      <p className="text-xs text-gray-400">Venues: {v.venueCount}</p>
                      <div className="text-xs text-gray-400">Joined: {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}</div>
                      {vendorDecisions[v.id] && (
                        <div className="text-xs px-2 py-1 rounded-full inline-block border border-white/15 text-gray-200">
                          Action: {vendorDecisions[v.id]}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => handleVendorDecision(v.id, "approved")}
                          className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVendorDecision(v.id, "rejected")}
                          className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            handleVendorDecision(v.id, "viewed");
                            setSelectedVendor(v);
                            setSelectedVenue(null);
                          }}
                          className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venues */}
            {tab === "venues" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Venue approvals</h3>
                  <span className="text-sm text-gray-300">{filteredVenues.length} in queue</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredVenues.map((v) => (
                    <div key={v.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">{v.id.slice(0, 8)}…</span>
                        <span className="text-xs text-gray-300">{v.vendor?.companyName || v.owner?.name || "Unassigned"}</span>
                      </div>
                      <p className="text-white font-semibold">{v.name}</p>
                      <p className="text-gray-300 text-sm">{v.capacity ? `${v.capacity} capacity` : "Capacity pending"} · {v.location || "No location"}</p>
                      <div className="text-xs text-gray-400">Added: {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}</div>
                      {venueDecisions[v.id] && (
                        <div className="text-xs px-2 py-1 rounded-full inline-block border border-white/15 text-gray-200">
                          Action: {venueDecisions[v.id]}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => handleVenueDecision(v.id, "approved")}
                          className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVenueDecision(v.id, "rejected")}
                          className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            handleVenueDecision(v.id, "viewed");
                            setSelectedVenue(v);
                            setSelectedVendor(null);
                          }}
                          className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "planners" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPlanners.map((p) => (
                  <div key={p.id} className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{p.displayName}</h3>
                        <p className="text-gray-300 text-sm">{p.servicesText}</p>
                        <p className="text-gray-400 text-xs mt-1">{p.user?.email}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs border border-white/20 text-gray-200">{p.status || "PENDING"}</span>
                    </div>
                    <div className="text-gray-300 text-sm">Events: {p.eventCount}</div>
                  </div>
                ))}
                {filteredPlanners.length === 0 && (
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-gray-300">No planners found.</div>
                )}
              </div>
            )}

            {tab === "users" && (
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                <table className="min-w-full divide-y divide-white/10 text-sm text-gray-200">
                  <thead className="bg-white/5 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">{u.name || "—"}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.role || "USER"}</td>
                        <td className="px-4 py-3">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="px-4 py-3 text-gray-400" colSpan={4}>No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bookings */}
            {tab === "bookings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Bookings oversight</h3>
                  <span className="text-sm text-gray-300">{bookings.length} total · {bookings.filter((b) => b.status === "PENDING").length} pending</span>
                </div>

                {/* Booking detail overlay */}
                {selectedBooking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-[#C6A14A]/30 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-semibold text-lg">Booking details</h4>
                      <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white"><XCircle size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-gray-400">Booking ID: <span className="text-white font-mono text-xs">{selectedBooking.id}</span></p>
                        <p className="text-gray-400">Customer: <span className="text-white">{selectedBooking.user?.name || selectedBooking.user?.email || "Guest"}</span></p>
                        <p className="text-gray-400">Email: <span className="text-white">{selectedBooking.user?.email || "—"}</span></p>
                        <p className="text-gray-400">Status: <span className={`px-2 py-0.5 rounded-full text-xs border ${selectedBooking.status === "CONFIRMED" ? "border-green-500/30 text-green-300" : selectedBooking.status === "CANCELLED" ? "border-red-500/30 text-red-300" : "border-[#C6A14A]/30 text-[#C6A14A]"}`}>{selectedBooking.status}</span></p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-400">Venue: <span className="text-white">{selectedBooking.venue?.name || "—"}</span></p>
                        <p className="text-gray-400">Location: <span className="text-white">{selectedBooking.venue?.location || "—"}</span></p>
                        <p className="text-gray-400">Vendor: <span className="text-white">{selectedBooking.vendor?.companyName || "—"}</span></p>
                        <p className="text-gray-400">Event date: <span className="text-[#C6A14A] font-semibold">{new Date(selectedBooking.eventDate).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span></p>
                        {selectedBooking.guestCount && <p className="text-gray-400">Guests: <span className="text-white">{selectedBooking.guestCount}</span></p>}
                        {selectedBooking.notes && <p className="text-gray-400">Notes: <span className="text-white">{selectedBooking.notes}</span></p>}
                      </div>
                    </div>

                    {/* Messages section */}
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-white font-semibold flex items-center gap-2"><MessageSquare size={16} className="text-[#C6A14A]" /> Conversation</h5>
                        <button onClick={() => loadBookingThread(selectedBooking.id)} className="text-xs text-[#C6A14A] hover:underline">Refresh</button>
                      </div>
                      {threadError[selectedBooking.id] && <p className="text-xs text-red-300">{threadError[selectedBooking.id]}</p>}
                      <div className="max-h-56 overflow-y-auto space-y-2 bg-black/20 rounded-lg p-3">
                        {(threadMessages[selectedBooking.id] || []).map((msg: any) => {
                          const ts = msg.createdAt ? new Date(msg.createdAt) : null;
                          const msgAtts = Array.isArray(msg.attachments) ? msg.attachments : [];
                          return (
                            <div key={msg.id} className="text-sm">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 capitalize">{(msg.senderRole || "guest").toLowerCase()}</span>
                                {ts && <span>{ts.toLocaleString()}</span>}
                              </div>
                              <p className="mt-1 text-white">{msg.content}</p>
                              {msgAtts.map((att: any, ai: number) => (
                                <div key={ai} className="mt-1">
                                  {att.type === "image" && <img src={att.url} alt="attachment" className="max-w-full max-h-24 rounded" />}
                                  {att.type === "video" && <video src={att.url} controls className="max-w-full max-h-24 rounded" />}
                                  {att.type === "link" && <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline break-all text-xs">{att.url}</a>}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {threadLoading[selectedBooking.id] && <p className="text-xs text-gray-400">Loading…</p>}
                        {!threadLoading[selectedBooking.id] && (threadMessages[selectedBooking.id] || []).length === 0 && <p className="text-xs text-gray-400">No messages yet.</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                          placeholder="Send message as admin…"
                          value={threadInput[selectedBooking.id] || ""}
                          onChange={(e) => setThreadInput((p) => ({ ...p, [selectedBooking.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminMessage(selectedBooking.id); } }}
                        />
                        <button
                          onClick={() => sendAdminMessage(selectedBooking.id)}
                          disabled={threadLoading[selectedBooking.id]}
                          className="px-3 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                      <button onClick={() => handleBookingDecision(selectedBooking.id, "resolved")} className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30 text-sm">Resolve</button>
                      <button onClick={() => handleBookingDecision(selectedBooking.id, "escalated")} className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30 text-sm">Escalate</button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${b.status === "CONFIRMED" ? "border-green-500/30 text-green-300 bg-green-500/10" : b.status === "CANCELLED" ? "border-red-500/30 text-red-300 bg-red-500/10" : "border-[#C6A14A]/30 text-[#C6A14A] bg-[#C6A14A]/10"}`}>{b.status}</span>
                        <span className="text-xs text-gray-400">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                      <p className="text-white font-semibold">{b.user?.name || b.user?.email || "Guest"}</p>
                      <p className="text-gray-300 text-sm">{b.venue?.name || "Venue TBD"} · {b.venue?.location || "No location"}</p>
                      {b.vendor?.companyName && <p className="text-gray-400 text-xs">Vendor: {b.vendor.companyName}</p>}
                      <p className="text-[#C6A14A] font-semibold text-sm">{new Date(b.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                      {b.guestCount && <p className="text-gray-400 text-xs">{b.guestCount} guests</p>}
                      {bookingDecisions[b.id] && (
                        <div className="text-xs px-2 py-1 rounded-full inline-block border border-white/15 text-gray-200">
                          Action: {bookingDecisions[b.id]}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm pt-1">
                        <button
                          onClick={() => { setSelectedBooking(b); loadBookingThread(b.id); }}
                          className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30 flex items-center gap-1"
                        >
                          <MessageSquare size={14} /> View details
                        </button>
                        <button
                          onClick={() => handleBookingDecision(b.id, "resolved")}
                          className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleBookingDecision(b.id, "escalated")}
                          className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30"
                        >
                          Escalate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {tab === "content" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Content & settings</h3>
                  <span className="text-sm text-gray-300">Drafts and published blocks</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {contentQueue.map((c) => (
                    <div key={c.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">{c.id}</span>
                        <span className="text-xs text-gray-300">{c.status}</span>
                      </div>
                      <p className="text-white font-semibold">{c.title}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <button className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30">Publish</button>
                        <button className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedVendor || selectedVenue) && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                <div className="w-full max-w-2xl rounded-xl border border-white/15 bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400">{selectedVendor ? "Vendor" : "Venue"} details</p>
                      <h3 className="text-white text-xl font-semibold">
                        {selectedVendor?.companyName || selectedVendor?.user?.name || selectedVenue?.name}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {selectedVendor
                          ? (selectedVendor.services || "Services pending")
                          : `${selectedVenue?.location || "Location"} · ${selectedVenue?.capacity ? `${selectedVenue.capacity} guests` : "Capacity TBD"}`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVendor(null);
                        setSelectedVenue(null);
                      }}
                      className="text-white/80 hover:text-white px-3 py-1 rounded-lg border border-white/15"
                    >
                      Close
                    </button>
                  </div>

                  {selectedVendor && (
                    <div className="space-y-2 text-sm text-gray-200">
                      <div className="flex justify-between"><span>Email</span><span>{selectedVendor.user?.email || "—"}</span></div>
                      <div className="flex justify-between"><span>Phone</span><span>{selectedVendor.services || "—"}</span></div>
                      <div className="flex justify-between"><span>Status</span><span>{selectedVendor.status || "PENDING"}</span></div>
                      <div>
                        <p className="text-gray-300">Venues ({selectedVendor.venues?.length || 0})</p>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          {(selectedVendor.venues || []).map((vn) => (
                            <div key={vn.id} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200">
                              <p className="text-white font-semibold">{vn.name}</p>
                              <p className="text-gray-300 text-xs">{vn.location || "Location"}</p>
                              <p className="text-gray-400 text-xs">Capacity: {vn.capacity || "—"}</p>
                            </div>
                          ))}
                          {(selectedVendor.venues || []).length === 0 && (
                            <div className="p-3 rounded-lg bg-white/5 border border-dashed border-white/15 text-xs text-gray-400">No venues yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedVenue && (
                    <div className="space-y-2 text-sm text-gray-200">
                      <div className="flex justify-between"><span>Location</span><span>{selectedVenue.location || "—"}</span></div>
                      <div className="flex justify-between"><span>Capacity</span><span>{selectedVenue.capacity || "—"}</span></div>
                      <div className="flex justify-between"><span>Price range</span><span>{selectedVenue.priceRange || "—"}</span></div>
                      <div className="flex justify-between"><span>Status</span><span>{selectedVenue.status || "PENDING"}</span></div>
                      <div className="flex justify-between"><span>Vendor</span><span>{selectedVenue.vendor?.companyName || selectedVenue.owner?.name || "Unassigned"}</span></div>
                      {!!(selectedVenue as any).amenities?.length && (
                        <div>
                          <p className="text-gray-300">Amenities</p>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            {((selectedVenue as any).amenities as string[]).map((a: string) => (
                              <span key={a} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Users & roles</h3>
                  <span className="text-sm text-gray-300">Manage admin team</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">{u.id}</span>
                        <span className="text-xs text-gray-300">{u.role || "USER"}</span>
                      </div>
                      <p className="text-white font-semibold">{u.name}</p>
                      <p className="text-gray-300 text-sm">{u.role}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <button className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15">Edit</button>
                        <button className="px-3 py-2 bg-red-500/15 text-red-300 rounded-lg border border-red-500/30">Disable</button>
                      </div>
                    </div>
                  ))}
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
