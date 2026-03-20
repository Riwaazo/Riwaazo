"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon,
  Calendar,
  MapPin,
  Users,
  Star,
  Wallet,
  CheckCircle,
  Check,
  Send,
  Paperclip,
  Image as ImageIcon,
  Link2,
  X,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { createClient } from "@/lib/supabase/client";

export default function VenueDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [greetingName, setGreetingName] = useState("Venue partner");
  const [userId, setUserId] = useState<string | null>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [venueForm, setVenueForm] = useState({
    name: "",
    location: "",
    mapEmbedUrl: "",
    capacity: "",
    priceRange: "",
    amenities: "",
    description: "",
  });
  const [bannerUrl, setBannerUrl] = useState("");
  const [gallerySlots, setGallerySlots] = useState<string[]>(["", "", "", ""]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const [savingListing, setSavingListing] = useState(false);
  const [listingMessage, setListingMessage] = useState<string | null>(null);
  const [creationMessage, setCreationMessage] = useState<string | null>(null);
  const [settingsName, setSettingsName] = useState("Venue partner");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [tab, setTab] = useState<"overview" | "inquiries" | "bookings" | "listing" | "settings">("overview");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<Record<string, any[]>>({});
  const [threadLoading, setThreadLoading] = useState<Record<string, boolean>>({});
  const [threadError, setThreadError] = useState<Record<string, string | null>>({});
  const [threadInput, setThreadInput] = useState<Record<string, string>>({});
  const [msgAttachments, setMsgAttachments] = useState<Record<string, Array<{ type: string; url: string }>>>({});
  const [showMsgAttachForm, setShowMsgAttachForm] = useState<Record<string, boolean>>({});
  const [msgAttachUrl, setMsgAttachUrl] = useState("");
  const [msgAttachType, setMsgAttachType] = useState("image");
  const [bookingUpdateLoading, setBookingUpdateLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata?.role as string | undefined;
      if (!data.user) {
        router.replace("/auth/login?role=venue-owner");
        return;
      }
      if ((role || "").toLowerCase() !== "venue-owner") {
        router.replace("/dashboard");
        return;
      }
      setUserId(data.user.id);
      const friendlyName =
        (data.user.user_metadata?.name as string | undefined) ||
        (data.user.user_metadata?.full_name as string | undefined) ||
        (data.user.user_metadata?.given_name as string | undefined) ||
        "Venue partner";
      setGreetingName(friendlyName);
      setSettingsName(friendlyName);
      setSettingsPhone((data.user.user_metadata?.phone as string | undefined) || "");
      setAuthChecked(true);
    })();
  }, [router, supabase]);

  useEffect(() => {
    if (!authChecked) return;
    let active = true;
    (async () => {
      setLoadingData(true);
      setLoadError(null);
      try {
        const [venuesRes, bookingsRes] = await Promise.all([
          fetch("/api/venues", { credentials: "include", cache: "no-store" }),
          fetch("/api/bookings", { credentials: "include", cache: "no-store" }),
        ]);

        if (!venuesRes.ok) {
          const detail = await venuesRes.json().catch(() => ({}));
          throw new Error(detail?.error || "Failed to load venues");
        }
        if (!bookingsRes.ok) {
          const detail = await bookingsRes.json().catch(() => ({}));
          throw new Error(detail?.error || "Failed to load bookings");
        }

        const [venuesJson, bookingsJson] = await Promise.all([venuesRes.json(), bookingsRes.json()]);
        if (!active) return;
        setVenues(venuesJson);
        setBookingsData(bookingsJson || []);
        const firstId = venuesJson?.[0]?.id || null;
        setSelectedVenueId((prev) => prev || firstId);
      } catch (err) {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load venues");
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authChecked]);

  useEffect(() => {
    const current = venues.find((v) => v.id === selectedVenueId) || venues[0];
    if (!current) return;
    setSelectedVenueId(current.id);
    setVenueForm({
      name: current.name || "",
      location: current.location || "",
      mapEmbedUrl: current.mapEmbedUrl || "",
      capacity: current.capacity ? String(current.capacity) : "",
      priceRange: current.priceRange || "",
      amenities: (current.amenities || []).join(", "),
      description: current.description || "",
    });
    const imgs = current.images || [];
    setBannerUrl(imgs[0] || "");
    const padded = [...imgs.slice(1, 5), "", "", "", ""].slice(0, 4);
    setGallerySlots(padded);
  }, [selectedVenueId, venues]);

  const uploadToStorage = async (file: File) => {
    const bucket = "vendor-media";
    const filePath = `venue/${userId || "anon"}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleUploadBanner = async (file?: File | null) => {
    if (!file) return;
    setUploadingBanner(true);
    setListingMessage(null);
    try {
      const url = await uploadToStorage(file);
      setBannerUrl(url);
      setListingMessage("Banner uploaded");
    } catch (err) {
      setListingMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUploadGallery = async (idx: number, file?: File | null) => {
    if (!file) return;
    setUploadingGalleryIndex(idx);
    setListingMessage(null);
    try {
      const url = await uploadToStorage(file);
      const next = [...gallerySlots];
      next[idx] = url;
      setGallerySlots(next);
      setListingMessage("Image uploaded");
    } catch (err) {
      setListingMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  const handleSaveListing = async () => {
    if (!selectedVenueId) return handleCreateVenue();
    setSavingListing(true);
    setListingMessage(null);
    setCreationMessage(null);
    const capacityValue = Number(venueForm.capacity);
    const safeCapacity = Number.isFinite(capacityValue) ? capacityValue : undefined;
    try {
      const res = await fetch("/api/venues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          venue: {
            id: selectedVenueId,
            name: venueForm.name,
            location: venueForm.location,
            mapEmbedUrl: venueForm.mapEmbedUrl,
            capacity: safeCapacity,
            priceRange: venueForm.priceRange,
            amenities: venueForm.amenities.split(",").map((a) => a.trim()).filter(Boolean),
            images: [
              bannerUrl,
              ...gallerySlots.map((a) => a.trim()).filter(Boolean),
            ].filter(Boolean),
            description: venueForm.description,
          },
        }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Save failed");
      }

      const updated = await res.json();
      setVenues((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setListingMessage("Saved");
    } catch (err) {
      setListingMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingListing(false);
    }
  };

  const handleCreateVenue = async () => {
    setSavingListing(true);
    setListingMessage(null);
    setCreationMessage(null);
    const capacityValue = Number(venueForm.capacity);
    const safeCapacity = Number.isFinite(capacityValue) ? capacityValue : undefined;
    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          venue: {
            name: venueForm.name || "Untitled venue",
            location: venueForm.location,
            mapEmbedUrl: venueForm.mapEmbedUrl,
            capacity: safeCapacity,
            priceRange: venueForm.priceRange,
            amenities: venueForm.amenities.split(",").map((a) => a.trim()).filter(Boolean),
            images: [
              bannerUrl,
              ...gallerySlots.map((a) => a.trim()).filter(Boolean),
            ].filter(Boolean),
            description: venueForm.description,
          },
        }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Create failed");
      }

      const created = await res.json();
      setVenues((prev) => [created, ...prev]);
      setSelectedVenueId(created.id);
      setCreationMessage("Draft venue created. You can keep editing and save again.");
    } catch (err) {
      setCreationMessage(err instanceof Error ? err.message : "Failed to create venue");
    } finally {
      setSavingListing(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: settingsName, phone: settingsPhone } });
      if (error) throw error;
      setSettingsMessage("Profile updated");
    } catch (err) {
      setSettingsMessage(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSettingsSaving(false);
    }
  };

  const currentVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];
  const bookingsForVenue = selectedVenueId ? bookingsData.filter((b) => b.venueId === selectedVenueId) : bookingsData;
  const confirmedBookings = bookingsForVenue.filter((b) => b.status === "CONFIRMED");
  const pendingBookings = bookingsForVenue.filter((b) => b.status === "PENDING");
  const occupancyPercent = Math.min(
    100,
    currentVenue?.capacity && confirmedBookings.length
      ? Math.round((confirmedBookings.length / Math.max(currentVenue.capacity, 1)) * 100)
      : confirmedBookings.length * 10
  );

  const ratingValue = currentVenue?.rating && currentVenue.rating > 0 ? Number(currentVenue.rating).toFixed(1) : "—";

  const monthlyCounts = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = ref.toLocaleString("en-US", { month: "short" });
      const count = bookingsForVenue.filter((b) => {
        if (!b.eventDate) return false;
        const d = new Date(b.eventDate);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
      }).length;
      buckets.push({ label, count });
    }
    return buckets;
  }, [bookingsForVenue]);
  const maxMonthlyCount = Math.max(1, ...monthlyCounts.map((m) => m.count));

  const stats = [
    { title: "Active inquiries", value: String(pendingBookings.length), delta: "live", icon: MapPin },
    { title: "Confirmed bookings", value: String(confirmedBookings.length), delta: "in pipeline", icon: CheckCircle },
    { title: "Occupancy", value: `${occupancyPercent}%`, delta: "estimate", icon: Users },
    { title: "Avg rating", value: ratingValue, delta: "guest reviews", icon: Star },
  ];
  const inquiriesList = bookingsForVenue.filter((b) => b.status === "PENDING");
  const confirmedList = bookingsForVenue.filter((b) => b.status === "CONFIRMED");
  const latestBookings = bookingsForVenue.slice(0, 5);

  const formatDate = (date?: string) => {
    if (!date) return "Date TBD";
    const parsed = new Date(date);
    return parsed.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const statusStyles: Record<string, string> = {
    New: "bg-blue-500/15 text-blue-200 border-blue-500/30",
    "In Review": "bg-amber-500/15 text-amber-200 border-amber-500/30",
    "Proposal Sent": "bg-purple-500/15 text-purple-200 border-purple-500/30",
    Confirmed: "bg-green-500/15 text-green-200 border-green-500/30",
    "Deposit Pending": "bg-orange-500/15 text-orange-200 border-orange-500/30",
    PENDING: "bg-blue-500/15 text-blue-200 border-blue-500/30",
    CONFIRMED: "bg-green-500/15 text-green-200 border-green-500/30",
    CANCELLED: "bg-red-500/15 text-red-200 border-red-500/30",
  };

  const loadThread = async (bookingId: string) => {
    setThreadLoading((prev) => ({ ...prev, [bookingId]: true }));
    setThreadError((prev) => ({ ...prev, [bookingId]: null }));
    try {
      const res = await fetch(`/api/bookings/messages?bookingId=${bookingId}`, { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to load messages");
      }
      const json = await res.json();
      setThreadMessages((prev) => ({ ...prev, [bookingId]: Array.isArray(json) ? json : [] }));
    } catch (err) {
      setThreadError((prev) => ({ ...prev, [bookingId]: err instanceof Error ? err.message : "Failed to load messages" }));
    } finally {
      setThreadLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const sendThreadMessage = async (bookingId: string) => {
    const content = (threadInput[bookingId] || "").trim();
    if (!content) return;
    setThreadLoading((prev) => ({ ...prev, [bookingId]: true }));
    setThreadError((prev) => ({ ...prev, [bookingId]: null }));
    try {
      const payload: any = { bookingId, content };
      const atts = msgAttachments[bookingId];
      if (atts?.length) payload.attachments = atts;
      const res = await fetch("/api/bookings/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to send message");
      }
      const json = await res.json();
      setThreadMessages((prev) => ({ ...prev, [bookingId]: [...(prev[bookingId] || []), json] }));
      setThreadInput((prev) => ({ ...prev, [bookingId]: "" }));
      setMsgAttachments((prev) => ({ ...prev, [bookingId]: [] }));
    } catch (err) {
      setThreadError((prev) => ({ ...prev, [bookingId]: err instanceof Error ? err.message : "Failed to send message" }));
    } finally {
      setThreadLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const updateBookingStatus = async (bookingId: string, status: "CONFIRMED" | "CANCELLED") => {
    setBookingUpdateLoading((prev) => ({ ...prev, [bookingId]: true }));
    const previous = bookingsData;
    setBookingsData((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: bookingId, status }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to update booking");
      }
    } catch (err) {
      setBookingsData(previous);
      setThreadError((prev) => ({ ...prev, [bookingId]: err instanceof Error ? err.message : "Failed to update booking" }));
    } finally {
      setBookingUpdateLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const renderContent = () => {
    if (!authChecked) {
      return (
        <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center text-white">
          Checking access…
        </div>
      );
    }

    return (
      <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-300">Venue dashboard</p>
                  <h1 className="text-3xl font-serif text-white">Manage inquiries, occupancy, and revenue</h1>
                  <p className="text-sm text-gray-300 mt-2">Welcome back, <span className="text-white font-semibold">{greetingName}</span>. Let’s keep your venue booked and guests delighted.</p>
                </div>
                <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap">
                  <Link
                    href="/auth/signup?role=venue-owner"
                    className="rounded-lg bg-[#C6A14A] px-4 py-2 text-center font-semibold text-black transition-colors hover:bg-[#E8C56B]"
                  >
                    Invite manager
                  </Link>
                  <Link
                    href="/venues"
                    className="rounded-lg border border-[#C6A14A] px-4 py-2 text-center font-semibold text-[#C6A14A] transition-colors hover:bg-[#C6A14A]/10"
                  >
                    View listing
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["overview", "inquiries", "bookings", "listing", "settings"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item as typeof tab)}
                  className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition-all sm:text-base ${
                    tab === item
                      ? "bg-[#C6A14A] text-black border-[#C6A14A]"
                      : "bg-white/10 text-white border-white/10 hover:bg-white/15"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.title}
                        className="p-5 rounded-xl bg-gradient-to-br from-[#6A0000] to-[#4A0000] border border-[#C6A14A]/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-300 text-sm">{stat.title}</p>
                          <div className="w-10 h-10 rounded-full bg-[#C6A14A]/15 flex items-center justify-center text-[#C6A14A]">
                            <Icon size={18} />
                          </div>
                        </div>
                        <p className="text-2xl font-semibold text-white">{stat.value}</p>
                        <p className="text-sm text-[#C6A14A] mt-1">{stat.delta}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Growth Overview */}
                <div className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Growth overview</p>
                      <h3 className="text-2xl font-serif text-white">Inquiries & bookings trend</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-sm border border-green-500/30">+16% MoM</span>
                      <span className="px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] text-sm border border-[#C6A14A]/30">Occupancy ↑</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <div className="flex items-end gap-3 h-40 w-full">
                        {monthlyCounts.map((m) => {
                          const height = Math.max(4, Math.round((m.count / maxMonthlyCount) * 100));
                          return (
                            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full rounded-md bg-gradient-to-t from-[#C6A14A]/20 to-[#C6A14A]/70 border border-[#C6A14A]/30" style={{ height: `${height}%` }}>
                                <div className="sr-only">{m.count} bookings</div>
                              </div>
                              <span className="text-xs text-gray-400">{m.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">New inquiries</p>
                        <p className="text-2xl font-semibold text-white">{inquiriesList.length}</p>
                        <p className="text-sm text-green-300">Live pipeline</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">Confirmed bookings</p>
                        <p className="text-2xl font-semibold text-white">{confirmedList.length}</p>
                        <p className="text-sm text-green-300">Ready to host</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">Occupancy (60d)</p>
                        <p className="text-2xl font-semibold text-white">{occupancyPercent}%</p>
                        <p className="text-sm text-[#C6A14A]">Goal 80%+</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Latest inquiries</h3>
                      <Link href="/venues" className="text-sm text-[#C6A14A] hover:text-[#E8C56B]">
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {inquiriesList.slice(0, 4).map((inq) => (
                        <div
                          key={inq.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div>
                            <p className="text-white font-semibold">{inq.user?.name || "Guest inquiry"}</p>
                            <p className="text-gray-300 text-sm">{inq.venue?.location || currentVenue?.location || "Location TBD"} · {formatDate(inq.eventDate)}</p>
                            {inq.notes && <p className="text-gray-400 text-xs mt-1">{inq.notes}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#C6A14A] font-semibold">{inq.guestCount ? `${inq.guestCount} guests` : "Guest count TBD"}</span>
                            <span className={`px-3 py-1 rounded-full text-xs border ${statusStyles[inq.status] || "border-white/20 text-white"}`}>
                              {inq.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {inquiriesList.length === 0 && (
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">
                          No active inquiries yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Bookings</h3>
                      <Link href="/venues" className="text-sm text-[#C6A14A] hover:text-[#E8C56B]">
                        Calendar
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {latestBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div>
                            <p className="text-white font-semibold">{booking.user?.name || "Booking"}</p>
                            <p className="text-gray-300 text-sm">{booking.venue?.name || "Venue"} · {formatDate(booking.eventDate)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#C6A14A] font-semibold">{booking.guestCount ? `${booking.guestCount} guests` : ""}</span>
                            <span className={`px-3 py-1 rounded-full text-xs border ${statusStyles[booking.status] || "border-white/20 text-white"}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {latestBookings.length === 0 && (
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">
                          No bookings yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listing */}
            {tab === "listing" && (
              <div className="space-y-6">
                {loadError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">{loadError}</div>
                )}
                {(listingMessage || creationMessage) && (
                  <div className="rounded-lg border border-white/15 bg-white/10 text-white px-4 py-2 text-sm">{listingMessage || creationMessage}</div>
                )}
                {loadingData && (
                  <div className="rounded-lg border border-white/10 bg-white/5 text-gray-200 px-4 py-3 text-sm">Loading venues…</div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-xl">Venue listing</h3>
                    <p className="text-gray-300 text-sm">Update details, pricing, gallery, and map for your venue.</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <label className="text-sm text-gray-200">Select venue</label>
                    {venues.length > 0 ? (
                      <select
                        className="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={selectedVenueId || ""}
                        onChange={(e) => setSelectedVenueId(e.target.value)}
                      >
                        {venues.map((v) => (
                          <option key={v.id} value={v.id} className="bg-[#2A0000]">
                            {v.name || "Venue"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={handleCreateVenue}
                        className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                      >
                        Create my first venue
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Core details</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Venue name</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.name}
                        onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Location</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.location}
                        onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Map preview</label>
                      {(venueForm.mapEmbedUrl || venueForm.location) ? (
                        <div className="h-48 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                          <iframe
                            title="Map preview"
                            src={venueForm.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(venueForm.location)}&output=embed`}
                            className="w-full h-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300">Add a location to see a map preview.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Description</label>
                      <textarea
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        rows={4}
                        value={venueForm.description}
                        onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Pricing & gallery</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Price range</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.priceRange}
                        onChange={(e) => setVenueForm({ ...venueForm, priceRange: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Capacity</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.capacity}
                        onChange={(e) => setVenueForm({ ...venueForm, capacity: e.target.value })}
                        inputMode="numeric"
                        placeholder="E.g. 300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Amenities (comma separated)</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.amenities}
                        onChange={(e) => setVenueForm({ ...venueForm, amenities: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Banner image URL or upload</label>
                      <div className="flex gap-2">
                        <input
                          className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                          placeholder="https://..."
                          value={bannerUrl}
                          onChange={(e) => setBannerUrl(e.target.value)}
                        />
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5">
                          {uploadingBanner ? "Uploading…" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleUploadBanner(e.target.files?.[0])}
                            disabled={uploadingBanner}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Gallery images (URL or upload)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                              placeholder={`Image ${idx + 1} URL`}
                              value={gallerySlots[idx]}
                              onChange={(e) => {
                                const next = [...gallerySlots];
                                next[idx] = e.target.value;
                                setGallerySlots(next);
                              }}
                            />
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5">
                              {uploadingGalleryIndex === idx ? "Uploading…" : "Upload"}
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleUploadGallery(idx, e.target.files?.[0])}
                                disabled={uploadingGalleryIndex === idx}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Listing preview (matches public view)</h4>
                  <div className="rounded-2xl overflow-hidden border border-[#C6A14A]/20 bg-gradient-to-br from-[#5A0000] to-[#2C0000]">
                    {/* Hero */}
                    <div
                      className={`relative h-64 ${bannerUrl ? "bg-cover bg-center" : "bg-gradient-to-br from-[#7A0000] to-[#4A0000]"}`}
                      style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
                    >
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full bg-[#C6A14A] text-black text-xs font-semibold">Featured venue</span>
                          <span className="flex items-center gap-1 text-[#C6A14A] text-xs"><Star size={14} fill="#C6A14A" /> 4.8</span>
                        </div>
                        <h2 className="text-3xl font-serif text-white">{venueForm.name || "Venue name"}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200 mt-1">
                          <span className="flex items-center gap-2"><MapPin size={16} /> {venueForm.location || "Location"}</span>
                          <span className="flex items-center gap-2"><Users size={16} /> {venueForm.capacity || "Capacity"}</span>
                          <span className="flex items-center gap-2"><Wallet size={16} /> {venueForm.priceRange || "On request"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-5 bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A]">
                      {/* Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(venueForm.amenities || "").split(",").map((a: string) => a.trim()).filter(Boolean).slice(0, 6).map((item: string) => (
                          <div key={item} className="flex items-start gap-2 text-gray-200 text-sm">
                            <Check size={16} className="text-[#C6A14A]" />
                            <span>{item}</span>
                          </div>
                        ))}
                        {!(venueForm.amenities || "").trim() && (
                          <div className="text-sm text-gray-300">Add amenities to showcase in highlights.</div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-200 text-sm leading-relaxed">{venueForm.description || "Add a short description to help guests understand your venue."}</p>

                      {/* Gallery */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-white font-semibold">Gallery</h5>
                          <span className="text-gray-300 text-sm">Preview</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[bannerUrl, ...gallerySlots].filter(Boolean).slice(0, 6).map((img, idx) => (
                            <div
                              key={idx}
                              className={`${img.startsWith("http") ? "bg-cover bg-center" : "bg-gradient-to-br from-[#7A0000] to-[#4A0000]"} h-24 rounded-lg border border-white/10`}
                              style={img.startsWith("http") ? { backgroundImage: `url(${img})` } : undefined}
                            />
                          ))}
                          {[bannerUrl, ...gallerySlots].filter(Boolean).length === 0 && (
                            <div className="h-24 rounded-lg border border-dashed border-white/15 bg-white/5 flex items-center justify-center text-xs text-gray-300 col-span-2 md:col-span-4">
                              Add images to see gallery preview
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Map */}
                      {(venueForm.mapEmbedUrl || venueForm.location) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <MapPin size={16} /> Location map
                          </div>
                          <div className="h-56 rounded-lg overflow-hidden border border-white/10">
                            <iframe
                              title="Map preview"
                              src={venueForm.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(venueForm.location)}&output=embed`}
                              className="w-full h-full"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Link
                      href={selectedVenueId ? `/venues/${selectedVenueId}` : "/venues"}
                      className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors text-center"
                    >
                      View public listing
                    </Link>
                    <p className="text-xs text-gray-300">Preview mirrors the public listing; save to publish changes.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={selectedVenueId ? handleSaveListing : handleCreateVenue}
                    disabled={savingListing}
                    className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                  >
                    {savingListing ? "Saving…" : selectedVenueId ? "Save listing" : "Create listing"}
                  </button>
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-5">
                {settingsMessage && (
                  <div className="rounded-lg border border-white/15 bg-white/10 text-white px-4 py-2 text-sm">{settingsMessage}</div>
                )}
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4">
                  <div>
                    <h3 className="text-white font-semibold text-xl">Profile settings</h3>
                    <p className="text-gray-300 text-sm">Update your name and phone shown to guests and in communications.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Display name</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Phone</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      disabled={settingsSaving}
                      className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                    >
                      {settingsSaving ? "Saving…" : "Save profile"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inquiries */}
            {tab === "inquiries" && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">All inquiries</h3>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/10 hover:bg-white/15 transition-colors">
                    Export CSV
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inquiriesList.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold">{inq.user?.name || "Guest inquiry"}</p>
                        <span className={`px-2 py-1 rounded-full text-xs border ${statusStyles[inq.status] || "border-white/20 text-white"}`}>
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{inq.venue?.name || currentVenue?.name || "Venue"}</p>
                      <p className="text-gray-300 text-sm">{inq.venue?.location || currentVenue?.location || "Location"}</p>
                      <p className="text-[#C6A14A] font-semibold">{inq.guestCount ? `${inq.guestCount} guests` : "Guest count TBD"}</p>
                      <p className="text-gray-300 text-sm">{formatDate(inq.eventDate)}</p>
                      {inq.notes && <p className="text-xs text-gray-400">{inq.notes}</p>}
                      <div className="flex gap-2 text-xs text-gray-300">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} /> Hold date
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <HomeIcon size={12} /> Share brochure
                        </span>
                      </div>
                    </div>
                  ))}
                  {inquiriesList.length === 0 && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm col-span-full">
                      No inquiries yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings */}
            {tab === "bookings" && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Bookings</h3>
                  <Link
                    href="/venues"
                    className="text-sm text-[#C6A14A] hover:text-[#E8C56B]"
                  >
                    View listing
                  </Link>
                </div>
                <div className="space-y-3">
                  {bookingsForVenue.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{booking.user?.name || "Booking"}</p>
                          <p className="text-gray-300 text-sm">{booking.venue?.name || currentVenue?.name || "Venue"} · {formatDate(booking.eventDate)}</p>
                          {booking.notes && <p className="text-xs text-gray-400 mt-1">{booking.notes}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#C6A14A] font-semibold">{booking.guestCount ? `${booking.guestCount} guests` : ""}</span>
                          <span className={`px-3 py-1 rounded-full text-xs border ${statusStyles[booking.status] || "border-white/20 text-white"}`}>
                            {booking.status}
                          </span>
                          {booking.status === "PENDING" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                                disabled={bookingUpdateLoading[booking.id]}
                                className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-200 text-xs hover:bg-green-500/30 disabled:opacity-60"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                                disabled={bookingUpdateLoading[booking.id]}
                                className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs hover:bg-red-500/30 disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              const next = activeThreadId === booking.id ? null : booking.id;
                              setActiveThreadId(next);
                              if (next && !threadMessages[booking.id] && !threadLoading[booking.id]) {
                                loadThread(booking.id);
                              }
                            }}
                            className="px-3 py-1 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10 transition-colors"
                          >
                            {activeThreadId === booking.id ? "Hide messages" : "Message"}
                          </button>
                        </div>
                      </div>

                      {activeThreadId === booking.id && (
                        <div className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-2">
                          {threadError[booking.id] && (
                            <div className="text-xs text-red-200">{threadError[booking.id]}</div>
                          )}
                          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                            {(threadMessages[booking.id] || []).map((msg) => {
                              const ts = msg.createdAt ? new Date(msg.createdAt) : null;
                              const msgAtts = Array.isArray(msg.attachments) ? msg.attachments : [];
                              return (
                                <div key={msg.id} className="text-sm text-gray-100">
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 capitalize">{(msg.senderRole || "guest").toLowerCase()}</span>
                                    {ts && <span>{ts.toLocaleString()}</span>}
                                  </div>
                                  <p className="mt-1 text-white">{msg.content}</p>
                                  {msgAtts.map((att: any, ai: number) => (
                                    <div key={ai} className="mt-1">
                                      {att.type === "image" && <img src={att.url} alt="attachment" className="max-w-full max-h-32 rounded" />}
                                      {att.type === "video" && <video src={att.url} controls className="max-w-full max-h-32 rounded" />}
                                      {att.type === "link" && <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline break-all text-xs">{att.url}</a>}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                            {threadLoading[booking.id] && (
                              <div className="text-xs text-gray-300">Loading messages…</div>
                            )}
                            {!threadLoading[booking.id] && (threadMessages[booking.id] || []).length === 0 && (
                              <div className="text-xs text-gray-300">No messages yet.</div>
                            )}
                          </div>
                          {/* Attachment preview */}
                          {(msgAttachments[booking.id] || []).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(msgAttachments[booking.id] || []).map((att, ai) => (
                                <span key={ai} className="flex items-center gap-1 bg-white/10 text-white text-xs px-2 py-1 rounded-lg border border-white/20">
                                  {att.type === "image" && <ImageIcon size={12} />}
                                  {att.type === "video" && <span className="text-[10px]">VID</span>}
                                  {att.type === "link" && <Link2 size={12} />}
                                  <span className="max-w-[100px] truncate">{att.url}</span>
                                  <button onClick={() => setMsgAttachments((p) => { const a = [...(p[booking.id] || [])]; a.splice(ai, 1); return { ...p, [booking.id]: a }; })} className="text-red-300 hover:text-red-100"><X size={12} /></button>
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Attachment form */}
                          {showMsgAttachForm[booking.id] && (
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                              <select className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white" value={msgAttachType} onChange={(e) => setMsgAttachType(e.target.value)}>
                                <option className="bg-[#0B0B14]" value="image">Image</option>
                                <option className="bg-[#0B0B14]" value="video">Video</option>
                                <option className="bg-[#0B0B14]" value="link">Link</option>
                              </select>
                              <input className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none" placeholder="Paste URL…" value={msgAttachUrl} onChange={(e) => setMsgAttachUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { if (msgAttachUrl.trim()) { setMsgAttachments((p) => ({ ...p, [booking.id]: [...(p[booking.id] || []), { type: msgAttachType, url: msgAttachUrl.trim() }] })); setMsgAttachUrl(""); setShowMsgAttachForm((p) => ({ ...p, [booking.id]: false })); } } }} />
                              <button onClick={() => { if (msgAttachUrl.trim()) { setMsgAttachments((p) => ({ ...p, [booking.id]: [...(p[booking.id] || []), { type: msgAttachType, url: msgAttachUrl.trim() }] })); setMsgAttachUrl(""); setShowMsgAttachForm((p) => ({ ...p, [booking.id]: false })); } }} className="text-xs px-2 py-1 bg-[#C6A14A] text-black rounded font-semibold">Add</button>
                              <button onClick={() => setShowMsgAttachForm((p) => ({ ...p, [booking.id]: false }))} className="text-gray-400 hover:text-white"><X size={14} /></button>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button onClick={() => setShowMsgAttachForm((p) => ({ ...p, [booking.id]: !p[booking.id] }))} className="p-2 text-gray-300 hover:text-[#C6A14A] transition-colors" title="Attach image, video, or link">
                              <Paperclip size={16} />
                            </button>
                            <input
                              className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                              placeholder="Type a reply"
                              value={threadInput[booking.id] || ""}
                              onChange={(e) => setThreadInput((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendThreadMessage(booking.id); } }}
                              onFocus={() => {
                                if (!threadMessages[booking.id] && !threadLoading[booking.id]) loadThread(booking.id);
                              }}
                            />
                            <button
                              onClick={() => sendThreadMessage(booking.id)}
                              disabled={threadLoading[booking.id]}
                              className="px-3 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {bookingsForVenue.length === 0 && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">
                      No bookings yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    );
  };

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />
        {renderContent()}
        <Footer />
      </div>
    </SwipeTransition>
  );
}
