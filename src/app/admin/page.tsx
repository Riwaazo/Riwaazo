"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Home as HomeIcon, ClipboardList, XCircle, Search, Filter, Settings, LineChart } from "lucide-react";
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
  owner?: { name?: string | null } | null;
  createdAt?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

type Booking = {
  id: string;
  status: string;
  eventDate: string;
  venue?: { id: string; name: string; location?: string | null } | null;
  vendor?: { companyName?: string | null } | null;
  user?: { name?: string | null; email?: string | null } | null;
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
  const [vendorDecisions, setVendorDecisions] = useState<Record<string, "approved" | "rejected" | "viewed">>({});
  const [venueDecisions, setVenueDecisions] = useState<Record<string, "approved" | "rejected" | "viewed">>({});
  const [bookingDecisions, setBookingDecisions] = useState<Record<string, "resolved" | "viewed" | "escalated">>({});
  const contentQueue: any[] = [];
  const users: any[] = [];
  const [tab, setTab] = useState<"overview" | "vendors" | "venues" | "bookings" | "content" | "users">("overview");
  const [filters, setFilters] = useState({ status: "all", city: "all", search: "" });
  const statusOptions = ["all"];
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
        const [vendorsRes, venuesRes, bookingsRes] = await Promise.all([
          fetch("/api/vendors", { credentials: "include", cache: "no-store" }),
          fetch("/api/venues", { credentials: "include", cache: "no-store" }),
          fetch("/api/bookings", { credentials: "include", cache: "no-store" }),
        ]);

        if (!vendorsRes.ok) throw new Error((await vendorsRes.json().catch(() => ({}))).error || "Failed to load vendors");
        if (!venuesRes.ok) throw new Error((await venuesRes.json().catch(() => ({}))).error || "Failed to load venues");
        if (!bookingsRes.ok) throw new Error((await bookingsRes.json().catch(() => ({}))).error || "Failed to load bookings");

        const [vendorsJson, venuesJson, bookingsJson] = await Promise.all([vendorsRes.json(), venuesRes.json(), bookingsRes.json()]);
        if (!active) return;
        setVendors(Array.isArray(vendorsJson) ? vendorsJson : []);
        setVenues(Array.isArray(venuesJson) ? venuesJson : []);
        setBookings(Array.isArray(bookingsJson) ? bookingsJson : []);
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
      const matchStatus = filters.status === "all" ? v.status === "PENDING" : v.status === filters.status.toUpperCase();
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
      const matchStatus = filters.status === "all" ? statusValue === "PENDING" : statusValue === filters.status.toUpperCase();
      return matchCity && matchSearch && matchStatus;
    });
  }, [venues, filters.city, filters.search, filters.status]);

  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "PENDING"), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === "CONFIRMED"), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === "CANCELLED"), [bookings]);
  const pendingVendors = useMemo(() => vendorCards.filter((v) => v.status === "PENDING"), [vendorCards]);
  const pendingVenues = useMemo(() => venues.filter((v) => (v.status || "PENDING") === "PENDING"), [venues]);

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

  const overviewCards = useMemo(
    () => [
      { title: "Pending vendors", value: pendingVendors.length.toString(), delta: `${vendorCards.length} total`, icon: Store },
      { title: "Pending venues", value: pendingVenues.length.toString(), delta: `${venues.length} total`, icon: HomeIcon },
      { title: "Pending bookings", value: pendingBookings.length.toString(), delta: `${confirmedBookings.length} confirmed`, icon: ClipboardList },
      { title: "Cancelled", value: cancelledBookings.length.toString(), delta: `${bookings.length} total`, icon: XCircle },
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
              {["overview", "vendors", "venues", "bookings", "content", "users"].map((item) => (
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
                          onClick={() => handleVendorDecision(v.id, "viewed")}
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
                          onClick={() => handleVenueDecision(v.id, "viewed")}
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

            {/* Bookings */}
            {tab === "bookings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Bookings oversight</h3>
                  <span className="text-sm text-gray-300">Escalations and monitoring</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">{b.id}</span>
                        <span className="text-xs text-gray-300">{b.status}</span>
                      </div>
                      <p className="text-white font-semibold">{b.user?.name || b.user?.email || "Guest"}</p>
                      <p className="text-gray-300 text-sm">{b.venue?.name || "Venue TBD"} · {b.venue?.location || "No location"}</p>
                      <p className="text-[#C6A14A] font-semibold">{new Date(b.eventDate).toLocaleDateString()}</p>
                      {bookingDecisions[b.id] && (
                        <div className="text-xs px-2 py-1 rounded-full inline-block border border-white/15 text-gray-200">
                          Action: {bookingDecisions[b.id]}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => handleBookingDecision(b.id, "resolved")}
                          className="px-3 py-2 bg-green-500/15 text-green-300 rounded-lg border border-green-500/30"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleBookingDecision(b.id, "viewed")}
                          className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15"
                        >
                          View
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
                        <span className="text-xs text-gray-300">{u.status}</span>
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
