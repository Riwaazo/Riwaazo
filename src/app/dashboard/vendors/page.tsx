"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Calendar,
  Star,
  Wallet,
  Users,
  TrendingUp,
  Filter,
  Send,
  MessageSquare,
  Paperclip,
  Image,
  Link2,
  X,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { createClient } from "@/lib/supabase/client";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatBudget = (value: number | string | null | undefined) => {
  if (typeof value === "number") return currencyFormatter.format(value);
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "—";
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "TBD";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};

const formatRelativeTime = (value?: string | Date | null) => {
  const date = value ? (value instanceof Date ? value : new Date(value)) : new Date();
  if (Number.isNaN(date.getTime())) return "just now";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const extractCity = (location?: string | null) => location?.split(",")[0]?.trim() || "—";

const estimateValueFromRange = (range?: string | null) => {
  if (!range) return 0;
  const matches = range.match(/\d+\s*[kK]?/g);
  if (!matches) return 0;
  const values = matches.map((token) => {
    const isK = token.toLowerCase().includes("k");
    const numeric = parseInt(token.replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(numeric) ? numeric * (isK ? 1000 : 1) : 0;
  });
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const vendorSections = [
  { id: "catering", label: "Catering" },
  { id: "photography", label: "Photography" },
  { id: "decor", label: "Decor" },
  { id: "dj", label: "DJ & Music" },
  { id: "makeup", label: "Makeup & Beauty" },
  { id: "planning", label: "Event Planning" },
];

const downloadCsv = (rows: Array<Record<string, string>>, filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => escapeCell(row[key] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function VendorDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any | null>(null);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [threadMessages, setThreadMessages] = useState<Record<string, any[]>>({});
  const [threadLoading, setThreadLoading] = useState<Record<string, boolean>>({});
  const [threadError, setThreadError] = useState<Record<string, string>>({});
  const [threadInput, setThreadInput] = useState<Record<string, string>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Record<string, Array<{ type: string; url: string }>>>({});
  const [showAttachForm, setShowAttachForm] = useState<Record<string, boolean>>({});
  const [attachUrl, setAttachUrl] = useState("");
  const [attachType, setAttachType] = useState("image");
  const [conversationSending, setConversationSending] = useState<Record<string, boolean>>({});

  const [tab, setTab] = useState<"overview" | "listings" | "leads" | "bookings" | "messages" | "storefront" | "settings">("overview");
  const [chartFilters, setChartFilters] = useState({
    range: "6m",
    category: "all",
    city: "all",
    channel: "all",
  });
  const [listingFilters, setListingFilters] = useState({
    type: "all",
    status: "all",
    city: "all",
    service: "all",
  });
  const [savingStorefront, setSavingStorefront] = useState(false);
  const [storefrontMessage, setStorefrontMessage] = useState<string | null>(null);
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsWebsite, setSettingsWebsite] = useState("");
  const [settingsLocation, setSettingsLocation] = useState("");
  const [settingsCompanyName, setSettingsCompanyName] = useState("");
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    companyName: "",
    category: "",
    services: "",
    eventTypes: "",
    location: "",
    mapEmbedUrl: "",
    phone: "",
    description: "",
    website: "",
    packages: [] as Array<{ name: string; price: string; features: string; description: string }>,
    gallery: ["", "", "", "", "", ""] as string[],
  });
  const [venueForm, setVenueForm] = useState({
    id: "",
    name: "",
    location: "",
    mapEmbedUrl: "",
    capacity: "",
    priceRange: "",
    amenities: "",
    eventTypes: "",
    images: "",
    description: "",
  });
  const [bannerUrl, setBannerUrl] = useState("");
  const [gallerySlots, setGallerySlots] = useState<string[]>(["", "", "", "", "", ""]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);

  const statusStyles: Record<string, string> = {
    New: "bg-blue-500/15 text-blue-200 border-blue-500/30",
    "In Review": "bg-amber-500/15 text-amber-200 border-amber-500/30",
    "Proposal Sent": "bg-purple-500/15 text-purple-200 border-purple-500/30",
    Confirmed: "bg-green-500/15 text-green-200 border-green-500/30",
    "Deposit Pending": "bg-orange-500/15 text-orange-200 border-orange-500/30",
    Cancelled: "bg-red-500/15 text-red-200 border-red-500/30",
  };

  const derivedBookings = useMemo(() => {
    const mapped = (bookingsData || []).map((booking) => {
      const status = booking.status === "CONFIRMED"
        ? "Confirmed"
        : booking.status === "CANCELLED"
          ? "Cancelled"
          : "In Review";
      const venueRange = booking.venue?.priceRange as string | undefined;
      const estimatedValue = estimateValueFromRange(venueRange);
      const value = estimatedValue ? formatBudget(estimatedValue) : formatBudget(venueRange || null);
      return {
        id: booking.id,
        client: booking.user?.name || booking.user?.email || "Client",
        event: booking.venue?.name || booking.eventName || "Event",
        date: formatDate(booking.eventDate),
        value,
        status,
        city: extractCity(booking.venue?.location),
        raw: booking,
      };
    });
    return mapped;
  }, [bookingsData]);

  const derivedLeads = useMemo(() => {
    const pendingFromBookings = (bookingsData || [])
      .filter((booking) => booking.status === "PENDING")
      .map((booking) => ({
        id: booking.id,
        event: booking.venue?.name || booking.eventName || "Booking",
        date: formatDate(booking.eventDate),
        city: extractCity(booking.venue?.location),
        budget: formatBudget(booking.budget || booking.venue?.priceRange || null),
        status: "In Review",
      }));

    const eventLeads = (eventsData || []).map((event: any) => ({
      id: event.id,
      event: event.title,
      date: formatDate(event.date),
      city: extractCity(event.venue?.location),
      budget: formatBudget(event.budget ?? event.venue?.priceRange ?? null),
      status: event.status === "PUBLISHED" ? "Proposal Sent" : event.status === "ARCHIVED" ? "Cancelled" : "New",
    }));

    const combined = [...pendingFromBookings, ...eventLeads];
    return combined;
  }, [bookingsData, eventsData]);

  const pipelineRecords = useMemo(() => {
    const leadRecords = derivedLeads.map((lead) => ({
      id: lead.id,
      name: lead.event,
      date: lead.date,
      city: lead.city,
      budget: lead.budget,
      status: lead.status,
      type: "Lead" as const,
    }));

    const bookingRecords = derivedBookings.map((booking) => ({
      id: booking.id,
      name: booking.event,
      date: booking.date,
      city: booking.city || booking.client,
      budget: booking.value,
      status: booking.status,
      type: "Booking" as const,
    }));

    return [...leadRecords, ...bookingRecords];
  }, [derivedBookings, derivedLeads]);

  const growthSeries = useMemo(() => {
    const now = new Date();
    const months: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = bookingsData.filter((b) => {
        const bd = new Date(b.eventDate || b.createdAt || now);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      }).length;
      months.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        value: count,
      });
    }
    return months;
  }, [bookingsData]);

  const growthPath = useMemo(() => {
    if (!growthSeries.length) return { path: "", fill: "", points: [] as { x: number; y: number }[] };
    const maxVal = Math.max(...growthSeries.map((p) => p.value), 1);
    const width = 216;
    const height = 120;
    const baseY = height;
    const stepX = growthSeries.length > 1 ? width / (growthSeries.length - 1) : width;

    const points = growthSeries.map((p, idx) => {
      const x = idx * stepX;
      const y = baseY - (p.value / maxVal) * 80;
      return { x, y };
    });

    const path = points
      .map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");

    const fill = `${path} L ${width} ${baseY} L 0 ${baseY} Z`;
    return { path, fill, points };
  }, [growthSeries]);

  const statCards = useMemo(() => {
    const activeLeads = derivedLeads.length;
    const confirmedBookings = derivedBookings.filter((b) => b.status === "Confirmed").length;
    const revenueNumber =
      derivedBookings.reduce((sum, booking) => {
        if (booking.raw?.venue?.priceRange) return sum + estimateValueFromRange(booking.raw.venue.priceRange || "");
        return sum;
      }, 0) || 0;
    const revenueEstimate = currencyFormatter.format(revenueNumber);
    const conversion = activeLeads ? Math.min(100, Math.round((confirmedBookings / activeLeads) * 100)) : 0;

    return [
      {
        title: "Active leads",
        value: String(activeLeads),
        delta: "+ live",
        icon: Users,
      },
      {
        title: "Monthly revenue",
        value: revenueEstimate,
        delta: `${confirmedBookings} confirmed`,
        icon: Wallet,
      },
      {
        title: "Conversion",
        value: `${conversion}%`,
        delta: "vs last period",
        icon: TrendingUp,
      },
      {
        title: "Rating",
        value: vendorProfile?.rating ? String(vendorProfile.rating) : "N/A",
        delta: vendorProfile?.reviews ? `${vendorProfile.reviews} reviews` : "No ratings yet",
        icon: Star,
      },
    ];
  }, [derivedBookings, derivedLeads, vendorProfile]);

  /* ---- Booking conversation helpers ---- */
  const loadBookingThread = async (bookingId: string) => {
    setThreadLoading((p) => ({ ...p, [bookingId]: true }));
    setThreadError((p) => ({ ...p, [bookingId]: "" }));
    try {
      const res = await fetch(`/api/bookings/messages?bookingId=${bookingId}`, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setThreadMessages((p) => ({ ...p, [bookingId]: data }));
    } catch (err) {
      setThreadError((p) => ({ ...p, [bookingId]: err instanceof Error ? err.message : "Error" }));
    } finally {
      setThreadLoading((p) => ({ ...p, [bookingId]: false }));
    }
  };

  const sendBookingMessage = async (bookingId: string) => {
    const text = (threadInput[bookingId] || "").trim();
    if (!text) return;
    setConversationSending((p) => ({ ...p, [bookingId]: true }));
    try {
      const payload: any = { bookingId, content: text };
      const atts = attachments[bookingId];
      if (atts?.length) payload.attachments = atts;
      const res = await fetch("/api/bookings/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Send failed");
      const saved = await res.json();
      setThreadMessages((p) => ({ ...p, [bookingId]: [...(p[bookingId] || []), saved] }));
      setThreadInput((p) => ({ ...p, [bookingId]: "" }));
      setAttachments((p) => ({ ...p, [bookingId]: [] }));
    } catch (err) {
      setThreadError((p) => ({ ...p, [bookingId]: err instanceof Error ? err.message : "Send failed" }));
    } finally {
      setConversationSending((p) => ({ ...p, [bookingId]: false }));
    }
  };

  const addAttachment = (bookingId: string) => {
    if (!attachUrl.trim()) return;
    setAttachments((p) => ({
      ...p,
      [bookingId]: [...(p[bookingId] || []), { type: attachType, url: attachUrl.trim() }],
    }));
    setAttachUrl("");
    setShowAttachForm((p) => ({ ...p, [bookingId]: false }));
  };

  const removeAttachment = (bookingId: string, idx: number) => {
    setAttachments((p) => {
      const arr = [...(p[bookingId] || [])];
      arr.splice(idx, 1);
      return { ...p, [bookingId]: arr };
    });
  };

  const openBookingConversation = (bookingId: string) => {
    const isOpen = activeThreadId === bookingId;
    setActiveThreadId(isOpen ? null : bookingId);
    if (!isOpen) loadBookingThread(bookingId);
    setTab("messages");
  };

  // Auto-poll active thread for new messages every 5 seconds
  useEffect(() => {
    if (!activeThreadId) return;
    const interval = setInterval(() => {
      fetch(`/api/bookings/messages?bookingId=${activeThreadId}`, { credentials: "include", cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data)) {
            setThreadMessages((prev) => ({ ...prev, [activeThreadId]: data }));
          }
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeThreadId]);

  const [bookingUpdating, setBookingUpdating] = useState<Record<string, boolean>>({});

  const handleBookingStatus = async (bookingId: string, status: "CONFIRMED" | "CANCELLED" | "PENDING") => {
    setBookingUpdating((p) => ({ ...p, [bookingId]: true }));
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
      // Update local state
      setBookingsData((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      console.error("Booking status update failed", err);
    } finally {
      setBookingUpdating((p) => ({ ...p, [bookingId]: false }));
    }
  };

  const exportLeadsCsv = () =>
    downloadCsv(
      derivedLeads.map((lead) => ({
        id: lead.id,
        event: lead.event,
        date: lead.date,
        city: lead.city,
        budget: lead.budget,
        status: lead.status,
      })),
      "leads.csv"
    );

  const exportBookingsCsv = () =>
    downloadCsv(
      derivedBookings.map((booking) => ({
        id: booking.id,
        client: booking.client,
        event: booking.event,
        date: booking.date,
        value: booking.value,
        status: booking.status,
      })),
      "bookings.csv"
    );

  const chartFilterOptions = {
    range: ["3m", "6m", "12m"],
    category: ["all", "decor", "catering", "photo", "planning"],
    city: ["all", "New Delhi", "Mumbai", "Bangalore"],
    channel: ["all", "Marketplace", "Instagram", "Referral"],
  };

  useEffect(() => {
    (async () => {
      // Prefer server profile for role/vendorProfileId to align with API filters
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        if (meRes.ok) {
          const { user } = await meRes.json();
          if (!user) {
            router.replace("/auth/login?role=vendor");
            return;
          }
          if ((user.role || "").toLowerCase() !== "vendor") {
            router.replace("/dashboard");
            return;
          }
          setUserId(user.id || null);
          setVendorProfileId(user.vendorProfileId || null);
          const friendly = user.name || (user.user_metadata?.name as string | undefined) || (user.user_metadata?.full_name as string | undefined) || "";
          setUserDisplayName(friendly);
          setAuthChecked(true);
          return;
        }
      } catch (_) {
        /* fall back to supabase */
      }

      const { data } = await supabase.auth.getUser();
      const role = data.user?.user_metadata?.role as string | undefined;
      if (!data.user) {
        router.replace("/auth/login?role=vendor");
        return;
      }
      if ((role || "").toLowerCase() !== "vendor") {
        router.replace("/dashboard");
        return;
      }
      setUserId(data.user.id);
      const friendly = (data.user.user_metadata?.name as string | undefined) || (data.user.user_metadata?.full_name as string | undefined) || "";
      setUserDisplayName(friendly);
      setVendorProfileId((data.user.user_metadata as any)?.vendorProfileId ?? null);
      setAuthChecked(true);
    })();
  }, [router, supabase]);

  useEffect(() => {
    if (!authChecked || !userId) return;

    let active = true;
    (async () => {
      setLoadingData(true);
      setLoadError(null);
      try {
        const endpoints = {
          vendors: "/api/vendors",
          bookings: "/api/bookings",
          events: "/api/events",
        } as const;

        const responses = await Promise.allSettled(
          Object.values(endpoints).map((url) => fetch(url, { credentials: "include", cache: "no-store" }))
        );

        if (!active) return;

        const unwrap = (idx: number) => responses[idx].status === "fulfilled" ? responses[idx].value : null;
        const vendorsRes = unwrap(0);
        const bookingsRes = unwrap(1);
        const eventsRes = unwrap(2);

        const hasUnauthorized = [vendorsRes, bookingsRes, eventsRes].some((res) => res?.status === 401);
        if (hasUnauthorized) {
          setLoadError("Session expired. Please sign in again.");
          router.replace("/auth/login?role=vendor");
          return;
        }

        const failing = [
          vendorsRes?.ok === false && `vendors (${vendorsRes.status})`,
          bookingsRes?.ok === false && `bookings (${bookingsRes.status})`,
          eventsRes?.ok === false && `events (${eventsRes.status})`,
        ].filter(Boolean) as string[];

        if (failing.length) {
          setLoadError(`Partial data loaded; issues with ${failing.join(", ")}`);
        }

        const [vendorsJson, bookingsJson, eventsJson] = await Promise.all([
          vendorsRes?.ok ? vendorsRes.json() : Promise.resolve([]),
          bookingsRes?.ok ? bookingsRes.json() : Promise.resolve([]),
          eventsRes?.ok ? eventsRes.json() : Promise.resolve([]),
        ]);

        const vendorForUser = (vendorsJson as any[]).find((v) => v.user?.id === userId || v.id === vendorProfileId) || (vendorsJson as any[])?.[0] || null;

        setVendorProfile(vendorForUser);
        setBookingsData(bookingsJson || []);
        setEventsData(eventsJson || []);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data");
      } finally {
        if (active) setLoadingData(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authChecked]);

  useEffect(() => {
    if (!vendorProfile) return;
    const servicesText = vendorProfile.services || "";
    const matchedSection = vendorSections.find((section) => servicesText.toLowerCase().includes(section.label.toLowerCase()))?.id || "";
    const packagesSource = (vendorProfile as any).packages;
    const packagesArray = Array.isArray(packagesSource)
      ? packagesSource.map((pkg: any) => ({
          name: pkg?.name || "",
          price: pkg?.price || "",
          description: pkg?.description || "",
          features: Array.isArray(pkg?.features) ? pkg.features.join(", ") : (pkg?.features || ""),
        }))
      : [];
    const galleryArray = Array.isArray((vendorProfile as any).gallery)
      ? ((vendorProfile as any).gallery.slice(0, 6).concat(["", "", "", "", "", ""]).slice(0, 6))
      : ["", "", "", "", "", ""];
    setVendorForm({
      companyName: vendorProfile.companyName || "",
      category: matchedSection,
      services: servicesText,
      eventTypes: (vendorProfile.eventTypes || []).join(", "),
      location: vendorProfile.location || "",
      mapEmbedUrl: vendorProfile.mapEmbedUrl || "",
      phone: vendorProfile.phone || "",
      description: vendorProfile.description || "",
      website: vendorProfile.website || "",
      packages: packagesArray,
      gallery: galleryArray,
    });
    setSettingsName(vendorProfile.user?.name || vendorProfile.companyName || "");
    setSettingsPhone(vendorProfile.phone || "");
    setSettingsWebsite(vendorProfile.website || "");
    setSettingsLocation(vendorProfile.location || "");
    setSettingsCompanyName(vendorProfile.companyName || "");
    const primaryVenue = vendorProfile.venues?.[0];
    if (primaryVenue) {
      setVenueForm({
        id: primaryVenue.id,
        name: primaryVenue.name || "",
        location: primaryVenue.location || "",
        mapEmbedUrl: primaryVenue.mapEmbedUrl || "",
        capacity: primaryVenue.capacity ? String(primaryVenue.capacity) : "",
        priceRange: primaryVenue.priceRange || "",
        amenities: (primaryVenue.amenities || []).join(", "),
        eventTypes: (primaryVenue.eventTypes || []).join(", "),
        images: (primaryVenue.images || []).join(", "),
        description: primaryVenue.description || "",
      });
      const imgs = primaryVenue.images || [];
      setBannerUrl(imgs[0] || "");
      const gallery = imgs.slice(1, 7);
      const padded = [...gallery, "", "", "", "", ""].slice(0, 6);
      setGallerySlots(padded);
    }
  }, [vendorProfile]);
  // Gallery upload for vendor profile
  const [uploadingVendorGalleryIndex, setUploadingVendorGalleryIndex] = useState<number | null>(null);
  const handleUploadVendorGallery = async (idx: number, file?: File | null) => {
    if (!file) return;
    setUploadingVendorGalleryIndex(idx);
    setStorefrontMessage(null);
    try {
      const url = await uploadToStorage(file);
      setVendorForm((prev) => {
        const next = [...prev.gallery];
        next[idx] = url;
        return { ...prev, gallery: next };
      });
      setStorefrontMessage("Image uploaded");
    } catch (err) {
      setStorefrontMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingVendorGalleryIndex(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center text-white">
        Checking access…
      </div>
    );
  }

  const greetingName = vendorProfile?.companyName || vendorProfile?.user?.name || userDisplayName || "Vendor partner";

  const statusOptions = [
    "all",
    "New",
    "In Review",
    "Proposal Sent",
    "Confirmed",
    "Deposit Pending",
    "Cancelled",
  ];

  const uploadToStorage = async (file: File) => {
    const bucket = "vendor-media";
    const filePath = `vendor/${userId || "anon"}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleUploadBanner = async (file?: File | null) => {
    if (!file) return;
    setUploadingBanner(true);
    setStorefrontMessage(null);
    try {
      const url = await uploadToStorage(file);
      setBannerUrl(url);
      setStorefrontMessage("Banner uploaded");
    } catch (err) {
      setStorefrontMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUploadGallery = async (idx: number, file?: File | null) => {
    if (!file) return;
    setUploadingGalleryIndex(idx);
    setStorefrontMessage(null);
    try {
      const url = await uploadToStorage(file);
      const next = [...gallerySlots];
      next[idx] = url;
      setGallerySlots(next);
      setStorefrontMessage("Image uploaded");
    } catch (err) {
      setStorefrontMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  const addPackage = () => {
    setVendorForm((prev) => ({
      ...prev,
      packages: [...(prev.packages || []), { name: "", price: "", description: "", features: "" }],
    }));
  };

  const updatePackage = (index: number, field: keyof { name: string; price: string; description: string; features: string }, value: string) => {
    setVendorForm((prev) => {
      const next = [...(prev.packages || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, packages: next };
    });
  };

  const removePackage = (index: number) => {
    setVendorForm((prev) => {
      const next = [...(prev.packages || [])];
      next.splice(index, 1);
      return { ...prev, packages: next };
    });
  };

  const handleSaveStorefront = async () => {
    setSavingStorefront(true);
    setStorefrontMessage(null);
    try {
      const capacityValue = Number(venueForm.capacity);
      const safeCapacity = Number.isFinite(capacityValue) ? capacityValue : undefined;
      const selectedSectionLabel = vendorSections.find((section) => section.id === vendorForm.category)?.label;
      const combinedServices = [selectedSectionLabel, vendorForm.services].filter(Boolean).join(", ");
      const packagesPayload = (vendorForm.packages || []).map((pkg) => ({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        features: (pkg.features || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      }));
      const res = await fetch("/api/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendor: {
            companyName: vendorForm.companyName,
            services: combinedServices,
            packages: packagesPayload,
            eventTypes: vendorForm.eventTypes
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean),
            location: vendorForm.location,
            phone: vendorForm.phone,
            description: vendorForm.description,
            website: vendorForm.website,
          },
          venue: {
            id: vendorProfile?.venues?.[0]?.id,
            name: venueForm.name,
            location: venueForm.location,
            capacity: safeCapacity,
            priceRange: venueForm.priceRange,
            amenities: venueForm.amenities
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean),
            eventTypes: venueForm.eventTypes
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean),
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

      const data = await res.json();
      setVendorProfile(data);
      setStorefrontMessage("Saved");
    } catch (error) {
      setStorefrontMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSavingStorefront(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage(null);
    try {
      const res = await fetch("/api/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vendor: {
            phone: settingsPhone,
            website: settingsWebsite,
            location: settingsLocation,
            companyName: settingsCompanyName,
          },
          user: { name: settingsName },
        }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to update profile");
      }
      const data = await res.json();
      setVendorProfile(data);
      setSettingsMessage("Profile updated");
    } catch (err) {
      setSettingsMessage(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSettingsSaving(false);
    }
  };

  const filteredRecords = pipelineRecords.filter((record) => {
    const matchesType =
      listingFilters.type === "all" || record.type.toLowerCase() === listingFilters.type;
    const matchesStatus =
      listingFilters.status === "all" || record.status === listingFilters.status;
    const matchesCity = listingFilters.city === "all" || record.city === listingFilters.city;
    const services = (vendorProfile?.services as string | undefined)?.toLowerCase() || "";
    const matchesService =
      listingFilters.service === "all" || services.includes(listingFilters.service.toLowerCase());
    return matchesType && matchesStatus && matchesCity && matchesService;
  });

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-24 pb-12 sm:pb-16 sm:pt-28">
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
                  <p className="text-sm text-gray-300">Vendor dashboard</p>
                  <h1 className="text-2xl font-serif text-white sm:text-3xl">Manage leads, bookings, and revenue</h1>
                  <p className="text-sm text-gray-300 mt-2">Welcome back, <span className="text-white font-semibold">{greetingName}</span>. Keep your storefront fresh and leads moving.</p>
                </div>
                <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap">
                  <Link
                      href="/auth/signup?role=vendor"
                    className="rounded-lg bg-[#C6A14A] px-4 py-2 text-center font-semibold text-black transition-colors hover:bg-[#E8C56B]"
                  >
                    Invite team
                  </Link>
                  <Link
                      href={vendorProfile ? `/vendors/storefront?vendorId=${encodeURIComponent(vendorProfile.id)}` : "/vendors/storefront"}
                    className="rounded-lg border border-[#C6A14A] px-4 py-2 text-center font-semibold text-[#C6A14A] transition-colors hover:bg-[#C6A14A]/10"
                  >
                    View storefront
                  </Link>
                </div>
              </div>
            </motion.div>

            {loadError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                {loadError}
              </div>
            )}

            {loadingData && (
              <div className="mb-4 rounded-lg border border-white/10 bg-white/5 text-gray-200 px-4 py-3 text-sm">
                Syncing latest vendor data…
              </div>
            )}

            {/* Tabs */}
            <div className="mb-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["overview", "listings", "leads", "bookings", "messages", "storefront", "settings"].map((item) => (
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
                  {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.title}
                        className="p-5 rounded-xl bg-gradient-to-br from-[#6A0000] to-[#4A0000] border border-[#C6A14A]/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-300 text-sm">{card.title}</p>
                          <div className="w-10 h-10 rounded-full bg-[#C6A14A]/15 flex items-center justify-center text-[#C6A14A]">
                            <Icon size={18} />
                          </div>
                        </div>
                        <p className="text-2xl font-semibold text-white">{card.value}</p>
                        <p className="text-sm text-[#C6A14A] mt-1">{card.delta}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Growth Overview */}
                <div className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Growth overview</p>
                      <h3 className="text-2xl font-serif text-white">Leads & revenue trend</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-sm border border-green-500/30">+18% MoM</span>
                      <span className="px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] text-sm border border-[#C6A14A]/30">Conversion ↑</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-300 mb-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                      <Filter size={14} className="text-[#C6A14A]" />
                      <span>Range</span>
                      <select
                        className="bg-transparent text-white text-xs focus:outline-none"
                        value={chartFilters.range}
                        onChange={(e) => setChartFilters({ ...chartFilters, range: e.target.value })}
                      >
                        {chartFilterOptions.range.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#2A0000]">
                            {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                      <span>Category</span>
                      <select
                        className="bg-transparent text-white text-xs focus:outline-none"
                        value={chartFilters.category}
                        onChange={(e) => setChartFilters({ ...chartFilters, category: e.target.value })}
                      >
                        {chartFilterOptions.category.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#2A0000]">
                            {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                      <span>City</span>
                      <select
                        className="bg-transparent text-white text-xs focus:outline-none"
                        value={chartFilters.city}
                        onChange={(e) => setChartFilters({ ...chartFilters, city: e.target.value })}
                      >
                        {chartFilterOptions.city.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#2A0000]">
                            {opt === "all" ? "All" : opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                      <span>Channel</span>
                      <select
                        className="bg-transparent text-white text-xs focus:outline-none"
                        value={chartFilters.channel}
                        onChange={(e) => setChartFilters({ ...chartFilters, channel: e.target.value })}
                      >
                        {chartFilterOptions.channel.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#2A0000]">
                            {opt === "all" ? "All" : opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <svg viewBox="0 0 220 140" className="w-full h-40">
                        <defs>
                          <linearGradient id="vendorGrowthFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C6A14A" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#C6A14A" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        {growthPath.path && (
                          <>
                            <path d={growthPath.fill} fill="url(#vendorGrowthFill)" stroke="none" />
                            <path
                              d={growthPath.path}
                              fill="none"
                              stroke="#C6A14A"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            {growthPath.points.map((pt, idx) => (
                              <circle
                                key={`${pt.x}-${pt.y}`}
                                cx={pt.x}
                                cy={pt.y}
                                r={4}
                                fill="#C6A14A"
                                className="drop-shadow-[0_0_6px_rgba(198,161,74,0.6)]"
                              />
                            ))}
                          </>
                        )}
                      </svg>
                      <div className="flex justify-between text-xs text-gray-400 px-1">
                        {growthSeries.map((m) => (
                          <span key={m.label}>{m.label}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">New leads</p>
                        <p className="text-2xl font-semibold text-white">{derivedLeads.length}</p>
                        <p className="text-sm text-green-300">Live</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">Confirmed bookings</p>
                        <p className="text-2xl font-semibold text-white">{derivedBookings.filter((b) => b.status === "Confirmed").length}</p>
                        <p className="text-sm text-green-300">Updated from data</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">Avg response time</p>
                        <p className="text-2xl font-semibold text-white">{derivedBookings.length ? "~1h" : "—"}</p>
                        <p className="text-sm text-[#C6A14A]">Based on inbox</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Recent leads</h3>
                      <Link href="/vendors" className="text-sm text-[#C6A14A] hover:text-[#E8C56B]">
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {derivedLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div>
                            <p className="text-white font-semibold">{lead.event}</p>
                            <p className="text-gray-300 text-sm">
                              {lead.city} · {lead.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#C6A14A] font-semibold">{lead.budget}</span>
                            <span className={`px-3 py-1 rounded-full text-xs border ${statusStyles[lead.status]}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Recent booking messages</h3>
                      <button onClick={() => setTab("messages")} className="text-sm text-[#C6A14A] hover:text-[#E8C56B]">
                        View all
                      </button>
                    </div>
                    <div className="space-y-3">
                      {derivedBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-white font-semibold">{booking.client}</p>
                              <p className="text-gray-300 text-sm">{booking.event} · {booking.date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs border ${statusStyles[booking.status] ?? "border-white/20 text-gray-200"}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => openBookingConversation(booking.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg text-sm hover:bg-[#C6A14A]/25 transition-colors"
                            >
                              <MessageSquare size={14} /> Message
                            </button>
                            {booking.raw?.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleBookingStatus(booking.id, "CONFIRMED")}
                                  disabled={bookingUpdating[booking.id]}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500/15 text-green-300 rounded-lg text-xs border border-green-500/30 hover:bg-green-500/25 disabled:opacity-50"
                                >
                                  <CheckCircle2 size={12} /> Confirm
                                </button>
                                <button
                                  onClick={() => handleBookingStatus(booking.id, "CANCELLED")}
                                  disabled={bookingUpdating[booking.id]}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 text-red-300 rounded-lg text-xs border border-red-500/30 hover:bg-red-500/25 disabled:opacity-50"
                                >
                                  <XCircle size={12} /> Decline
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {!derivedBookings.length && (
                        <div className="text-sm text-gray-300 border border-dashed border-white/10 rounded-lg p-4">
                          No bookings yet. Share your storefront to start receiving bookings.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listings */}
            {tab === "listings" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Pipeline &amp; listings</h3>
                    <span className="text-sm text-gray-300">{filteredRecords.length} records</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-lg"
                      value={listingFilters.type}
                      onChange={(e) => setListingFilters({ ...listingFilters, type: e.target.value })}
                    >
                      <option className="bg-[#2A0000]" value="all">All types</option>
                      <option className="bg-[#2A0000]" value="lead">Leads</option>
                      <option className="bg-[#2A0000]" value="booking">Bookings</option>
                    </select>
                    <select
                      className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-lg"
                      value={listingFilters.status}
                      onChange={(e) => setListingFilters({ ...listingFilters, status: e.target.value })}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} className="bg-[#2A0000]" value={status}>
                          {status === "all" ? "All status" : status}
                        </option>
                      ))}
                    </select>
                    <select
                      className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-lg"
                      value={listingFilters.city}
                      onChange={(e) => setListingFilters({ ...listingFilters, city: e.target.value })}
                    >
                      <option className="bg-[#2A0000]" value="all">All cities</option>
                      {[...new Set(pipelineRecords.map((r) => r.city).filter(Boolean))].map((city) => (
                        <option key={city} className="bg-[#2A0000]" value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <select
                      className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-lg"
                      value={listingFilters.service}
                      onChange={(e) => setListingFilters({ ...listingFilters, service: e.target.value })}
                    >
                      <option className="bg-[#2A0000]" value="all">All services</option>
                      {Array.from(
                        new Set(
                          (vendorProfile?.services as string | undefined)?.split(",")?.map((s) => s.trim()).filter(Boolean) || []
                        )
                      ).map((svc) => (
                        <option key={svc} className="bg-[#2A0000]" value={svc}>
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecords.map((record, idx) => (
                    <div key={`${record.type}-${record.id}-${idx}`} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full border border-white/20 text-gray-200">
                          {record.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${statusStyles[record.status] ?? "border-white/20 text-gray-200"}`}>
                          {record.status}
                        </span>
                      </div>
                      <h4 className="text-white font-semibold">{record.name}</h4>
                      <p className="text-gray-300 text-sm">{record.city} · {record.date}</p>
                      <p className="text-[#C6A14A] font-semibold">{record.budget}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <button
                          onClick={() => router.push("/vendors/storefront")}
                          className="underline hover:text-white"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => {
                            // Open messages tab for this record if it's a booking
                            if (record.type === "Booking") {
                              openBookingConversation(record.id);
                            } else {
                              setTab("messages");
                            }
                          }}
                          className="underline hover:text-white"
                        >
                          Message
                        </button>
                        <button
                          onClick={() =>
                            downloadCsv(
                              [
                                {
                                  id: record.id,
                                  type: record.type,
                                  name: record.name,
                                  date: record.date,
                                  city: record.city,
                                  budget: record.budget,
                                  status: record.status,
                                },
                              ],
                              `${record.id}.csv`
                            )
                          }
                          className="underline hover:text-white"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRecords.length === 0 && (
                  <div className="text-center text-gray-300 py-6 border border-dashed border-white/20 rounded-lg">
                    No records match the selected filters.
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Leads */}
            {tab === "leads" && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">All leads</h3>
                  <button
                    onClick={exportLeadsCsv}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/10 hover:bg-white/15 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {derivedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold">{lead.event}</p>
                        <span className={`px-2 py-1 rounded-full text-xs border ${statusStyles[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{lead.city} · {lead.date}</p>
                      <p className="text-[#C6A14A] font-semibold">{lead.budget}</p>
                      <div className="flex gap-2 text-xs text-gray-300">
                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} /> Email client
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} /> Call
                        </span>
                      </div>
                    </div>
                  ))}
                  {!derivedLeads.length && (
                    <div className="text-sm text-gray-300 border border-dashed border-white/20 rounded-lg p-4">
                      No leads yet. Share your storefront to attract prospects.
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
                    href="/vendors/storefront"
                    className="text-sm text-[#C6A14A] hover:text-[#E8C56B]"
                  >
                    View storefront
                  </Link>
                  <button
                    onClick={exportBookingsCsv}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/10 hover:bg-white/15 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="space-y-3">
                  {derivedBookings.map((booking) => {
                    const isPending = booking.raw?.status === "PENDING";
                    const isConfirmed = booking.raw?.status === "CONFIRMED";
                    const updating = bookingUpdating[booking.id];
                    return (
                    <div
                      key={booking.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{booking.client}</p>
                          <p className="text-gray-300 text-sm">{booking.event} · {booking.date}</p>
                          {booking.raw?.guestCount && <p className="text-gray-400 text-xs">{booking.raw.guestCount} guests</p>}
                          {booking.raw?.notes && <p className="text-gray-400 text-xs mt-1 italic">"{booking.raw.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[#C6A14A] font-semibold">{booking.value}</span>
                          <span className={`px-3 py-1 rounded-full text-xs border ${statusStyles[booking.status] ?? "border-white/20 text-gray-200"}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openBookingConversation(booking.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg text-sm hover:bg-[#C6A14A]/25 transition-colors"
                        >
                          <MessageSquare size={14} /> Message
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleBookingStatus(booking.id, "CONFIRMED")}
                              disabled={updating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 text-green-300 rounded-lg text-sm border border-green-500/30 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} /> Confirm
                            </button>
                            <button
                              onClick={() => handleBookingStatus(booking.id, "CANCELLED")}
                              disabled={updating}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-300 rounded-lg text-sm border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={14} /> Decline
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <button
                            onClick={() => handleBookingStatus(booking.id, "CANCELLED")}
                            disabled={updating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-300 rounded-lg text-sm border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                        {updating && <span className="text-xs text-gray-400">Updating…</span>}
                      </div>
                    </div>
                    );
                  })}
                  {!derivedBookings.length && (
                    <div className="text-sm text-gray-300 border border-dashed border-white/20 rounded-lg p-4">
                      No bookings yet. Publish your listing to start receiving bookings.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            {tab === "messages" && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20 space-y-4">
                <div>
                  <h3 className="text-white font-semibold">Booking conversations</h3>
                  <p className="text-gray-300 text-sm">Message customers directly on each booking. Attach images, videos, or links.</p>
                </div>

                {!derivedBookings.length && (
                  <div className="text-sm text-gray-300 border border-dashed border-white/20 rounded-lg p-6 text-center">
                    No bookings yet. Once a customer books, you can message them here.
                  </div>
                )}

                <div className="space-y-4">
                  {derivedBookings.map((booking) => {
                    const isOpen = activeThreadId === booking.id;
                    const messages = threadMessages[booking.id] || [];
                    const loading = threadLoading[booking.id];
                    const error = threadError[booking.id];
                    const sending = conversationSending[booking.id];
                    const bookingAttachments = attachments[booking.id] || [];

                    return (
                      <div key={booking.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        {/* Booking header */}
                        <div className="p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-white font-semibold">{booking.client}</p>
                              <p className="text-gray-300 text-sm">{booking.event} · {booking.date}</p>
                              {booking.raw?.guestCount && <p className="text-gray-400 text-xs">{booking.raw.guestCount} guests</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[#C6A14A] font-semibold text-sm">{booking.value}</span>
                              <span className={`px-2 py-1 rounded-full text-xs border ${statusStyles[booking.status] ?? "border-white/20 text-gray-200"}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {booking.raw?.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleBookingStatus(booking.id, "CONFIRMED")}
                                  disabled={bookingUpdating[booking.id]}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500/15 text-green-300 rounded-lg text-xs border border-green-500/30 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle2 size={12} /> Confirm
                                </button>
                                <button
                                  onClick={() => handleBookingStatus(booking.id, "CANCELLED")}
                                  disabled={bookingUpdating[booking.id]}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 text-red-300 rounded-lg text-xs border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                                >
                                  <XCircle size={12} /> Decline
                                </button>
                              </>
                            )}
                            {booking.raw?.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleBookingStatus(booking.id, "CANCELLED")}
                                disabled={bookingUpdating[booking.id]}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 text-red-300 rounded-lg text-xs border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            )}
                            {bookingUpdating[booking.id] && <span className="text-xs text-gray-400">Updating…</span>}
                            <button
                              onClick={() => {
                                const next = isOpen ? null : booking.id;
                                setActiveThreadId(next);
                                if (next) loadBookingThread(booking.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg text-sm hover:bg-[#C6A14A]/25 transition-colors"
                            >
                              <MessageSquare size={14} />
                              {isOpen ? "Hide" : "Message"}
                            </button>
                          </div>
                        </div>

                        {/* Conversation panel */}
                        {isOpen && (
                          <div className="border-t border-white/10 p-4 space-y-3">
                            {loading && <p className="text-gray-300 text-sm">Loading messages…</p>}
                            {error && <p className="text-red-300 text-sm">{error}</p>}

                            {/* Message bubbles */}
                            <div className="max-h-72 overflow-y-auto space-y-2">
                              {messages.map((msg: any) => {
                                const isMe = msg.senderId === userId;
                                const msgAttachments = Array.isArray(msg.attachments) ? msg.attachments : [];
                                return (
                                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${isMe ? "bg-[#C6A14A] text-black" : "bg-white/10 text-white"}`}>
                                      <p className="font-semibold text-xs mb-1">{msg.senderRole}{isMe ? " (You)" : ""}</p>
                                      <p>{msg.content}</p>
                                      {msgAttachments.map((att: any, ai: number) => (
                                        <div key={ai} className="mt-2">
                                          {att.type === "image" && (
                                            <img src={att.url} alt="attachment" className="max-w-full max-h-40 rounded" />
                                          )}
                                          {att.type === "video" && (
                                            <video src={att.url} controls className="max-w-full max-h-40 rounded" />
                                          )}
                                          {att.type === "link" && (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-300 break-all">{att.url}</a>
                                          )}
                                        </div>
                                      ))}
                                      <p className={`text-[11px] mt-1 ${isMe ? "text-black/60" : "text-white/50"}`}>
                                        {formatRelativeTime(msg.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {!loading && !messages.length && (
                                <p className="text-gray-300 text-sm text-center py-4">No messages yet. Start the conversation.</p>
                              )}
                            </div>

                            {/* Attachment preview */}
                            {bookingAttachments.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {bookingAttachments.map((att, ai) => (
                                  <span key={ai} className="flex items-center gap-1 bg-white/10 text-white text-xs px-2 py-1 rounded-lg border border-white/20">
                                    {att.type === "image" && <Image size={12} />}
                                    {att.type === "video" && <span className="text-[10px]">VID</span>}
                                    {att.type === "link" && <Link2 size={12} />}
                                    <span className="max-w-[120px] truncate">{att.url}</span>
                                    <button onClick={() => removeAttachment(booking.id, ai)} className="text-red-300 hover:text-red-100">
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Attachment form */}
                            {showAttachForm[booking.id] && (
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                                <select
                                  className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-white"
                                  value={attachType}
                                  onChange={(e) => setAttachType(e.target.value)}
                                >
                                  <option className="bg-[#2A0000]" value="image">Image</option>
                                  <option className="bg-[#2A0000]" value="video">Video</option>
                                  <option className="bg-[#2A0000]" value="link">Link</option>
                                </select>
                                <input
                                  className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                  placeholder="Paste URL…"
                                  value={attachUrl}
                                  onChange={(e) => setAttachUrl(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") addAttachment(booking.id); }}
                                />
                                <button onClick={() => addAttachment(booking.id)} className="text-xs px-2 py-1 bg-[#C6A14A] text-black rounded font-semibold">
                                  Add
                                </button>
                                <button onClick={() => setShowAttachForm((p) => ({ ...p, [booking.id]: false }))} className="text-gray-400 hover:text-white">
                                  <X size={14} />
                                </button>
                              </div>
                            )}

                            {/* Input bar */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowAttachForm((p) => ({ ...p, [booking.id]: !p[booking.id] }))}
                                className="p-2 text-gray-300 hover:text-[#C6A14A] transition-colors"
                                title="Attach image, video, or link"
                              >
                                <Paperclip size={18} />
                              </button>
                              <input
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                placeholder={`Message ${booking.client}…`}
                                value={threadInput[booking.id] || ""}
                                onChange={(e) => setThreadInput((p) => ({ ...p, [booking.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendBookingMessage(booking.id); } }}
                              />
                              <button
                                onClick={() => sendBookingMessage(booking.id)}
                                disabled={sending || !(threadInput[booking.id] || "").trim()}
                                className="px-3 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                              >
                                <Send size={16} />
                                {sending ? "…" : "Send"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storefront editing */}
            {tab === "storefront" && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#8B0000] to-[#5A0000] border border-[#C6A14A]/20 space-y-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-semibold text-xl">Storefront</h3>
                  <p className="text-gray-200 text-sm">Update banner details, contact info, and gallery shown on your public page.</p>
                  {storefrontMessage && (
                    <div className="text-sm px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">
                      {storefrontMessage}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Vendor details</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Company name</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.companyName}
                        onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Section (choose one)</label>
                      <select
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.category}
                        onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                      >
                        <option value="" className="bg-[#0B0B14] text-gray-200">Select a section</option>
                        {vendorSections.map((section) => (
                          <option key={section.id} value={section.id} className="bg-[#0B0B14] text-gray-200">
                            {section.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-300">Pick where your listing should appear in the vendor directory.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Services (comma separated)</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.services}
                        onChange={(e) => setVendorForm({ ...vendorForm, services: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Office/location</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.location}
                        onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                        placeholder="City, country or address"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Map preview</label>
                      {(vendorForm.mapEmbedUrl || vendorForm.location) ? (
                        <div className="h-40 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                          <iframe
                            title="Vendor map preview"
                            src={vendorForm.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(vendorForm.location)}&output=embed`}
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
                      <label className="text-sm text-gray-200">Event types (comma separated)</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.eventTypes}
                        onChange={(e) => setVendorForm({ ...vendorForm, eventTypes: e.target.value })}
                        placeholder="Weddings, Corporate, Birthdays"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-200">Packages</label>
                        <button
                          type="button"
                          onClick={addPackage}
                          className="text-sm px-3 py-1 rounded-lg border border-white/20 text-white hover:bg-white/10"
                        >
                          Add package
                        </button>
                      </div>
                      {(vendorForm.packages || []).length === 0 && (
                        <p className="text-sm text-gray-300">No packages added yet.</p>
                      )}
                      <div className="space-y-3">
                        {(vendorForm.packages || []).map((pkg, idx) => (
                          <div key={idx} className="border border-white/10 rounded-lg p-3 space-y-2 bg-white/5">
                            <div className="flex gap-2">
                              <input
                                className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                                placeholder="Package name (e.g., Silver)"
                                value={pkg.name}
                                onChange={(e) => updatePackage(idx, "name", e.target.value)}
                              />
                              <input
                                className="w-40 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                                placeholder="Price"
                                value={pkg.price}
                                onChange={(e) => updatePackage(idx, "price", e.target.value)}
                              />
                            </div>
                            <textarea
                              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                              rows={2}
                              placeholder="Short description"
                              value={pkg.description}
                              onChange={(e) => updatePackage(idx, "description", e.target.value)}
                            />
                            <input
                              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                              placeholder="Features (comma separated)"
                              value={pkg.features}
                              onChange={(e) => updatePackage(idx, "features", e.target.value)}
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => removePackage(idx)}
                                className="text-sm text-red-200 hover:text-red-100"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setSavingStorefront(true);
                            setStorefrontMessage(null);
                            try {
                              const selectedSectionLabel = vendorSections.find((section) => section.id === vendorForm.category)?.label;
                              const combinedServices = [selectedSectionLabel, vendorForm.services].filter(Boolean).join(", ");
                              const packagesPayload = (vendorForm.packages || []).map((pkg) => ({
                                name: pkg.name,
                                price: pkg.price,
                                description: pkg.description,
                                features: (pkg.features || "")
                                  .split(",")
                                  .map((f) => f.trim())
                                  .filter(Boolean),
                              }));
                              const res = await fetch("/api/vendors", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                  vendor: {
                                    packages: packagesPayload,
                                  },
                                }),
                              });
                              if (!res.ok) {
                                const detail = await res.json().catch(() => ({}));
                                throw new Error(detail?.error || "Save failed");
                              }
                              const data = await res.json();
                              setVendorProfile(data);
                              setStorefrontMessage("Packages saved");
                            } catch (error) {
                              setStorefrontMessage(error instanceof Error ? error.message : "Failed to save packages");
                            } finally {
                              setSavingStorefront(false);
                            }
                          }}
                          disabled={savingStorefront}
                          className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                        >
                          {savingStorefront ? "Saving…" : "Save packages"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Phone</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.phone}
                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Website</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.website}
                        onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">About</label>
                      <textarea
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={vendorForm.description}
                        onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                        rows={4}
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
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Partner venue (optional)</h4>
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
                        placeholder="E.g. 150"
                        inputMode="numeric"
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
                      <label className="text-sm text-gray-200">Event types (comma separated)</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.eventTypes}
                        onChange={(e) => setVenueForm({ ...venueForm, eventTypes: e.target.value })}
                        placeholder="Weddings, Corporate, Social"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Gallery images (URL or upload)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
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
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Venue description</label>
                      <textarea
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={venueForm.description}
                        onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveStorefront}
                    disabled={savingStorefront}
                    className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                  >
                    {savingStorefront ? "Saving…" : "Save storefront"}
                  </button>
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div className="space-y-6">
                {/* Profile Settings */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white font-semibold text-xl">Profile settings</h3>
                    <p className="text-gray-200 text-sm">Manage your vendor profile information used across all experiences.</p>
                    {settingsMessage && (
                      <div className="text-sm px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white">{settingsMessage}</div>
                    )}
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
                      <label className="text-sm text-gray-200">Company name</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={settingsCompanyName}
                        onChange={(e) => setSettingsCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Email</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed focus:outline-none"
                        value={vendorProfile?.user?.email || ""}
                        readOnly
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed here.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Phone</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Website</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        placeholder="https://yourwebsite.com"
                        value={settingsWebsite}
                        onChange={(e) => setSettingsWebsite(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-200">Location / City</label>
                      <input
                        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none"
                        placeholder="e.g. Lahore, Pakistan"
                        value={settingsLocation}
                        onChange={(e) => setSettingsLocation(e.target.value)}
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

                {/* Account & Security */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white font-semibold text-xl">Account &amp; security</h3>
                    <p className="text-gray-200 text-sm">Manage your password and account access.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={async () => {
                        const email = vendorProfile?.user?.email;
                        if (!email) return;
                        setPasswordResetSent(false);
                        await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/auth/login`,
                        });
                        setPasswordResetSent(true);
                      }}
                      className="px-4 py-2 bg-white/10 border border-white/15 text-white rounded-lg hover:bg-white/15 transition-colors text-sm"
                    >
                      Send password reset email
                    </button>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.replace("/auth/login");
                      }}
                      className="px-4 py-2 bg-red-500/15 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/25 transition-colors text-sm"
                    >
                      Sign out
                    </button>
                  </div>
                  {passwordResetSent && (
                    <p className="text-sm text-green-300">Password reset email sent. Check your inbox.</p>
                  )}
                </div>

                {/* Quick Links */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-4">
                  <h3 className="text-white font-semibold text-xl">Quick links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setTab("storefront")}
                      className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C6A14A]/15 flex items-center justify-center text-[#C6A14A]">
                        <Eye size={18} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Edit storefront</p>
                        <p className="text-gray-400 text-xs">Update your public vendor profile</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setTab("bookings")}
                      className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C6A14A]/15 flex items-center justify-center text-[#C6A14A]">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Manage bookings</p>
                        <p className="text-gray-400 text-xs">View and respond to booking requests</p>
                      </div>
                    </button>
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
