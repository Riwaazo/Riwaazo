"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  CircleCheck,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  Send,
  Settings,
  Sparkles,
  TimerReset,
  User,
  X,
  Image,
  Link2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/shared/Navbar";

type Event = {
  id: string;
  title: string;
  date?: string | null;
  status: string;
  venue?: { id: string; name: string; location?: string | null } | null;
  organizer?: { name?: string | null; email?: string | null } | null;
};

type Message = {
  id: string;
  fromName: string;
  subject: string;
  preview?: string | null;
  read: boolean;
  createdAt?: string;
};

type Booking = {
  id: string;
  status: string;
  eventDate?: string | null;
  event?: { title?: string } | null;
  vendor?: { businessName?: string } | null;
  venue?: { name?: string } | null;
  createdAt?: string;
};

type Notification = {
  id: string;
  title: string;
  category?: string | null;
  read: boolean;
  createdAt?: string;
};

type ThreadMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt?: string;
  attachments?: Array<{ type: string; url: string }>;
};

type PlannerProfile = {
  id?: string;
  companyName?: string;
  bio?: string;
  services?: string[];
  phone?: string;
  website?: string;
  location?: string;
};

export default function EventPlannerDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeframe, setTimeframe] = useState<"WEEK" | "MONTH" | "QUARTER">("MONTH");
  const [eventTab, setEventTab] = useState<"UPCOMING" | "ACTIVE" | "COMPLETED">("UPCOMING");
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [plannerName, setPlannerName] = useState<string>("");
  const [tab, setTab] = useState<"overview" | "events" | "bookings" | "messages" | "notifications" | "profile" | "settings">("overview");
  const [userId, setUserId] = useState<string | null>(null);
  const [plannerProfile, setPlannerProfile] = useState<PlannerProfile | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ companyName: "", bio: "", services: "", phone: "", website: "", location: "" });
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<Record<string, ThreadMessage[]>>({});
  const [threadLoading, setThreadLoading] = useState<Record<string, boolean>>({});
  const [threadInput, setThreadInput] = useState<Record<string, string>>({});
  const [conversationSending, setConversationSending] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState<Record<string, Array<{ type: string; url: string }>>>({});
  const [showAttachForm, setShowAttachForm] = useState<Record<string, boolean>>({});
  const [attachUrl, setAttachUrl] = useState("");
  const [attachType, setAttachType] = useState("image");
  const [settingsForm, setSettingsForm] = useState({ displayName: "", email: "", emailNotifications: true, smsNotifications: false });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const palette = {
    gold: "#C6A14A",
    goldLight: "#F4D58D",
    red: "#8B1E3F",
    redDark: "#6B122F",
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const roleRaw = data.user?.user_metadata?.role as string | undefined;
      const role = roleRaw?.toUpperCase();
      const isPlanner = role === "EVENT_PLANNER" || role === "PLANNER";
      if (!data.user || !isPlanner) {
        setAuthError("Only event planners can access this dashboard");
        router.replace("/dashboard");
        return;
      }
      const name = (data.user.user_metadata?.full_name as string | undefined) || data.user.email || "Planner";
      setPlannerName(name);
      setUserId(data.user.id);
      setSettingsForm((prev) => ({ ...prev, displayName: name, email: data.user!.email || "" }));
      setAuthChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!authChecked) return;
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [eventsRes, messagesRes, bookingsRes, notificationsRes] = await Promise.all([
          fetch("/api/events", { cache: "no-store", credentials: "include" }),
          fetch("/api/messages", { cache: "no-store", credentials: "include" }),
          fetch("/api/bookings", { cache: "no-store", credentials: "include" }),
          fetch("/api/notifications", { cache: "no-store", credentials: "include" }),
        ]);

        if (!eventsRes.ok || !messagesRes.ok || !bookingsRes.ok) {
          throw new Error("Failed to load planner data");
        }

        const [eventsJson, messagesJson, bookingsJson] = await Promise.all([
          eventsRes.json(),
          messagesRes.json(),
          bookingsRes.json(),
        ]);
        const notificationsJson = notificationsRes.ok ? await notificationsRes.json() : [];

        if (!active) return;
        setEvents(Array.isArray(eventsJson) ? eventsJson : []);
        setMessages(Array.isArray(messagesJson) ? messagesJson : []);
        setBookings(Array.isArray(bookingsJson) ? bookingsJson : []);
        setNotifications(Array.isArray(notificationsJson) ? notificationsJson : []);
      } catch (err) {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authChecked]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date && new Date(e.date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      .slice(0, 5);
  }, [events]);

  const activeEvents = useMemo(() => events.filter((e) => e.status === "PUBLISHED" || e.status === "CONFIRMED"), [events]);
  const unreadMessages = useMemo(() => messages.filter((m) => !m.read).length, [messages]);
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "PENDING").length, [bookings]);
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

  /* ---- Profile fetch ---- */
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        const res = await fetch("/api/event-planners", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const profiles = Array.isArray(data) ? data : [];
        const mine = profiles.find((p: any) => p.userId === userId);
        if (mine) {
          setPlannerProfile(mine);
          setProfileForm({
            companyName: mine.companyName || "",
            bio: mine.bio || "",
            services: Array.isArray(mine.services) ? mine.services.join(", ") : "",
            phone: mine.phone || "",
            website: mine.website || "",
            location: mine.location || "",
          });
        }
      } catch { /* ignore */ }
    })();
  }, [authChecked, userId]);

  /* ---- Thread helpers ---- */
  const loadThread = async (messageId: string) => {
    if (threadMessages[messageId]) {
      setActiveThreadId(messageId);
      return;
    }
    setThreadLoading((p) => ({ ...p, [messageId]: true }));
    try {
      const res = await fetch(`/api/messages?threadOf=${messageId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setThreadMessages((p) => ({ ...p, [messageId]: Array.isArray(data) ? data : [] }));
      }
    } catch { /* ignore */ }
    setThreadLoading((p) => ({ ...p, [messageId]: false }));
    setActiveThreadId(messageId);
  };

  const sendReply = async (messageId: string) => {
    const body = (threadInput[messageId] || "").trim();
    if (!body) return;
    setConversationSending((p) => ({ ...p, [messageId]: true }));
    try {
      const payload: any = { threadOf: messageId, body };
      if (attachments[messageId]?.length) payload.attachments = attachments[messageId];
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (res.ok) {
        const newMsg = await res.json();
        setThreadMessages((p) => ({ ...p, [messageId]: [...(p[messageId] || []), newMsg] }));
        setThreadInput((p) => ({ ...p, [messageId]: "" }));
        setAttachments((p) => ({ ...p, [messageId]: [] }));
      }
    } catch { /* ignore */ }
    setConversationSending((p) => ({ ...p, [messageId]: false }));
  };

  const addAttachment = (messageId: string) => {
    if (!attachUrl.trim()) return;
    setAttachments((p) => ({
      ...p,
      [messageId]: [...(p[messageId] || []), { type: attachType, url: attachUrl.trim() }],
    }));
    setAttachUrl("");
    setShowAttachForm((p) => ({ ...p, [messageId]: false }));
  };

  const removeAttachment = (messageId: string, idx: number) => {
    setAttachments((p) => ({
      ...p,
      [messageId]: (p[messageId] || []).filter((_, i) => i !== idx),
    }));
  };

  /* ---- Profile save ---- */
  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const payload = {
        companyName: profileForm.companyName,
        bio: profileForm.bio,
        services: profileForm.services.split(",").map((s) => s.trim()).filter(Boolean),
        phone: profileForm.phone,
        website: profileForm.website,
        location: profileForm.location,
      };
      const res = await fetch("/api/event-planners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setPlannerProfile(updated);
      }
    } catch { /* ignore */ }
    setProfileSaving(false);
  };

  /* ---- Booking actions ---- */
  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
      }
    } catch { /* ignore */ }
  };

  const checklist = useMemo(() => {
    return upcomingEvents.map((e) => ({
      id: e.id,
      title: `Finalize ${e.title}`,
      due: e.date ? new Date(e.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBD",
    }));
  }, [upcomingEvents]);

  const pipeline = useMemo(() => {
    const buckets: Record<string, number> = { draft: 0, published: 0, confirmed: 0, completed: 0 };
    events.forEach((e) => {
      const status = (e.status || "").toLowerCase();
      if (status.includes("draft")) buckets.draft += 1;
      else if (status.includes("confirm")) buckets.confirmed += 1;
      else if (status.includes("publish")) buckets.published += 1;
      else if (status.includes("complete")) buckets.completed += 1;
    });
    const total = Math.max(1, events.length);
    return {
      draft: { count: buckets.draft, pct: Math.round((buckets.draft / total) * 100) },
      published: { count: buckets.published, pct: Math.round((buckets.published / total) * 100) },
      confirmed: { count: buckets.confirmed, pct: Math.round((buckets.confirmed / total) * 100) },
      completed: { count: buckets.completed, pct: Math.round((buckets.completed / total) * 100) },
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const start = (() => {
      const d = new Date();
      if (timeframe === "WEEK") d.setDate(d.getDate() - 7);
      else if (timeframe === "MONTH") d.setMonth(d.getMonth() - 1);
      else d.setMonth(d.getMonth() - 3);
      return d.getTime();
    })();

    return events.filter((e) => {
      const ts = e.date ? new Date(e.date).getTime() : null;
      const inRange = ts ? ts >= start && ts >= now - 2 * 24 * 60 * 60 * 1000 : true;
      if (eventTab === "UPCOMING") return ts ? ts >= now : false;
      if (eventTab === "ACTIVE") return e.status === "PUBLISHED" || e.status === "CONFIRMED";
      return e.status === "COMPLETED" || e.status === "CANCELLED";
    });
  }, [eventTab, events, timeframe]);

  const tasksByBucket = useMemo(() => {
    const now = new Date();
    const thisWeekEnd = new Date();
    thisWeekEnd.setDate(now.getDate() + 7);

    const buckets = { today: [] as typeof checklist, week: [] as typeof checklist, later: [] as typeof checklist };
    filteredEvents.forEach((e) => {
      const dueLabel = e.date ? new Date(e.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBD";
      const task = { id: e.id, title: `Run-of-show for ${e.title}`, due: dueLabel };
      if (!e.date) buckets.later.push(task);
      else {
        const dt = new Date(e.date);
        if (dt.toDateString() === now.toDateString()) buckets.today.push(task);
        else if (dt <= thisWeekEnd) buckets.week.push(task);
        else buckets.later.push(task);
      }
    });
    return buckets;
  }, [filteredEvents]);

  const markMessageRead = async (id: string) => {
    setUpdatingMessageId(id);
    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: updated.read } : m)));
      }
    } finally {
      setUpdatingMessageId(null);
    }
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 py-12 flex items-center justify-center">
        {authError || "Checking access…"}
      </main>
    );
  }

  const baseShell = (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-4 animate-pulse">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-8 w-16 bg-white/20 rounded mt-3" />
          <div className="h-3 w-20 bg-white/10 rounded mt-2" />
        </div>
      ))}
    </div>
  );

  const tabItems = ["overview", "events", "bookings", "messages", "notifications", "profile", "settings"] as const;

  return (
    <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 pb-12 pt-28 relative overflow-hidden">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${palette.red}26` }} />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${palette.gold}1f` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#111827_1px,transparent_0)] [background-size:24px_24px] opacity-15" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-8">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: palette.goldLight }}>
              <Sparkles size={14} /> Event Planner
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-400">
              <span className="text-white text-2xl font-semibold">Planner Control Room</span>
              <span className="h-6 w-px bg-white/10" />
              <span>Dashboard</span>
              <ArrowRight size={12} />
              <span style={{ color: palette.goldLight }}>Live overview</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/events")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:border-white/30"
              style={{ borderColor: `${palette.red}80`, backgroundColor: `${palette.red}26` }}
            >
              <Plus size={16} /> New event
            </button>
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-200 hover:border-white/40"
              style={{ borderColor: `${palette.red}80`, backgroundColor: `${palette.red}1f` }}
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Welcome bar */}
        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-300">Welcome back,</p>
            <p className="text-2xl font-semibold text-white">{plannerName || "Planner"}</p>
            <p className="text-sm text-gray-400">Your portfolio, events, and communications in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/event-planners" className="rounded-lg px-3 py-2 text-sm" style={{ border: `1px solid ${palette.red}`, backgroundColor: `${palette.red}1f`, color: palette.goldLight }}>
              View marketplace listing
            </Link>
            <Link href="/event-planner/profile" className="rounded-lg px-3 py-2 text-sm" style={{ border: `1px solid ${palette.gold}`, backgroundColor: `${palette.gold}26`, color: palette.goldLight }}>
              Edit profile
            </Link>
          </div>
        </section>

        {loadError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{loadError}</div>
        )}

        {/* ===== Tab Bar ===== */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {tabItems.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all border whitespace-nowrap ${
                tab === item
                  ? "bg-[#C6A14A] text-black border-[#C6A14A]"
                  : "bg-white/10 text-white border-white/10 hover:bg-white/15"
              }`}
            >
              {item}
              {item === "notifications" && unreadNotifications.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">{unreadNotifications.length}</span>
              )}
              {item === "messages" && unreadMessages > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">{unreadMessages}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? baseShell : (
          <>
            {/* ============ OVERVIEW TAB ============ */}
            {tab === "overview" && (
              <div className="space-y-8">
                {/* Stat cards */}
                <section className="grid gap-4 md:grid-cols-4">
                  {[{
                    label: "Active events",
                    value: activeEvents.length,
                    detail: `${events.length} total in range`,
                    icon: Calendar,
                  }, {
                    label: "Upcoming",
                    value: filteredEvents.filter((e) => e.date && new Date(e.date) >= new Date()).length,
                    detail: timeframe === "WEEK" ? "Next 7 days" : timeframe === "MONTH" ? "Past month" : "Past quarter",
                    icon: TimerReset,
                  }, {
                    label: "Pending bookings",
                    value: pendingBookings,
                    detail: "Awaiting confirmation",
                    icon: CheckCircle2,
                  }, {
                    label: "Unread messages",
                    value: unreadMessages,
                    detail: `${messages.length} messages`,
                    icon: Mail,
                  }].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">{card.label}</p>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${palette.red}26`, color: palette.goldLight }}>
                            <Icon size={16} />
                          </div>
                        </div>
                        <p className="text-3xl font-semibold text-white">{card.value}</p>
                        <p className="text-xs mt-1" style={{ color: palette.goldLight }}>{card.detail}</p>
                      </div>
                    );
                  })}
                </section>

                {/* Unread notifications summary */}
                {unreadNotifications.length > 0 && (
                  <section className="rounded-2xl border border-[#C6A14A]/30 bg-white/5 p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bell size={18} style={{ color: palette.gold }} />
                        <h2 className="text-lg font-semibold text-white">Notifications</h2>
                        <span className="px-2 py-0.5 text-xs rounded-full font-semibold" style={{ backgroundColor: `${palette.gold}26`, color: palette.gold }}>{unreadNotifications.length} new</span>
                      </div>
                      <button onClick={() => setTab("notifications")} className="text-sm hover:underline" style={{ color: palette.goldLight }}>View all →</button>
                    </div>
                    <div className="space-y-2">
                      {unreadNotifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#C6A14A]/20 bg-black/20 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white line-clamp-2">{n.title}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {n.category && <span className="capitalize">{n.category.toLowerCase()} · </span>}
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                            </p>
                          </div>
                          <button onClick={() => markNotificationRead(n.id)} className="shrink-0 text-xs px-2 py-1 rounded-md" style={{ border: `1px solid ${palette.gold}50`, color: palette.goldLight }}>Dismiss</button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Event pipeline + Playbook */}
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Event pipeline</h2>
                        <p className="text-sm text-gray-400">Track draft → published → confirmed → completed</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {[{ key: "WEEK", label: "7d" }, { key: "MONTH", label: "30d" }, { key: "QUARTER", label: "90d" }].map((range) => (
                          <button
                            key={range.key}
                            onClick={() => setTimeframe(range.key as typeof timeframe)}
                            className={`px-3 py-1.5 rounded-lg border text-xs ${timeframe === range.key ? "text-white" : "text-gray-300 hover:border-white/30"}`}
                            style={timeframe === range.key ? { borderColor: palette.red, backgroundColor: `${palette.red}26` } : { borderColor: "#1f2937", backgroundColor: "rgba(255,255,255,0.05)" }}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-4">
                      {[{ label: "Draft", key: "draft" }, { label: "Published", key: "published" }, { label: "Confirmed", key: "confirmed" }, { label: "Completed", key: "completed" }].map((item) => {
                        const data = pipeline[item.key as keyof typeof pipeline];
                        return (
                          <div key={item.key} className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="flex items-center justify-between text-sm text-gray-300">
                              <span>{item.label}</span>
                              <BarChart3 size={14} style={{ color: palette.goldLight }} />
                            </div>
                            <p className="text-2xl font-semibold text-white mt-1">{data.count}</p>
                            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                              <div className="h-2 rounded-full" style={{ width: `${Math.min(100, data.pct)}%`, backgroundImage: `linear-gradient(90deg, ${palette.red}, ${palette.goldLight})` }} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{data.pct}% of total</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Playbook</h2>
                        <p className="text-sm text-gray-400">Quick moves to keep momentum</p>
                      </div>
                      <CircleCheck size={18} className="text-[#C6A14A]" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-200">
                      {[
                        { icon: Calendar, title: "Share updated run-of-show", desc: "Send timeline to vendors before next milestone" },
                        { icon: Mail, title: "Broadcast vendor brief", desc: "Attach floorplan, schedules, and access instructions" },
                        { icon: MessageSquare, title: "Clear unread threads", desc: "Aim for sub-2h SLA on new inbound messages" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <Icon size={14} style={{ color: palette.goldLight }} />
                            <div>
                              <p className="font-medium text-white">{item.title}</p>
                              <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* Quick links */}
                <section className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: "View Events", desc: "Manage upcoming, active, and completed events", action: () => setTab("events") },
                    { label: "View Bookings", desc: "Track and manage all your bookings", action: () => setTab("bookings") },
                    { label: "View Messages", desc: `${unreadMessages} unread message${unreadMessages !== 1 ? "s" : ""}`, action: () => setTab("messages") },
                  ].map((link) => (
                    <button
                      key={link.label}
                      onClick={link.action}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg text-left hover:border-[#C6A14A]/40 transition"
                    >
                      <p className="font-semibold text-white">{link.label}</p>
                      <p className="text-sm text-gray-400 mt-1">{link.desc}</p>
                      <p className="text-sm mt-2" style={{ color: palette.goldLight }}>Go →</p>
                    </button>
                  ))}
                </section>
              </div>
            )}

            {/* ============ EVENTS TAB ============ */}
            {tab === "events" && (
              <div className="space-y-8">
                {/* Event list */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {[{ key: "UPCOMING", label: "Upcoming" }, { key: "ACTIVE", label: "Active" }, { key: "COMPLETED", label: "Completed" }].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setEventTab(t.key as typeof eventTab)}
                          className="px-3 py-2 rounded-lg text-sm border"
                          style={eventTab === t.key ? { borderColor: palette.red, backgroundColor: `${palette.red}26`, color: palette.goldLight } : { borderColor: "#1f2937", backgroundColor: "rgba(255,255,255,0.05)", color: "#d1d5db" }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <BarChart3 size={14} style={{ color: palette.goldLight }} />
                      {filteredEvents.length} in view
                    </div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {filteredEvents.length === 0 && <p className="text-sm text-gray-400">No events match this view.</p>}
                    {filteredEvents.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <MapPin size={14} /> {item.venue?.name || "Venue TBD"} {item.venue?.location ? `• ${item.venue.location}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                          </span>
                          <span className="rounded-full px-3 py-1" style={{ border: `1px solid ${palette.red}`, color: palette.goldLight, backgroundColor: `${palette.red}1f` }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Coordination board */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Coordination board</h2>
                    <span className="text-xs text-gray-400">Auto-grouped from events</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[{ key: "today", label: "Today" }, { key: "week", label: "This week" }, { key: "later", label: "Later" }].map((col) => (
                      <div key={col.key} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                          <span>{col.label}</span>
                          <CircleCheck size={14} style={{ color: palette.goldLight }} />
                        </div>
                        <div className="space-y-2">
                          {tasksByBucket[col.key as keyof typeof tasksByBucket].length === 0 && (
                            <p className="text-xs text-gray-500">No tasks here.</p>
                          )}
                          {tasksByBucket[col.key as keyof typeof tasksByBucket].map((task) => (
                            <div key={task.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200">
                              <p className="font-medium text-white line-clamp-2">{task.title}</p>
                              <p className="text-xs text-gray-400">Due {task.due}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ============ BOOKINGS TAB ============ */}
            {tab === "bookings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Bookings</h2>
                  <span className="text-sm text-gray-400">{bookings.length} total · {pendingBookings} pending</span>
                </div>

                {bookings.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <Calendar size={40} className="mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No bookings yet. Start by creating an event!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{b.event?.title || b.venue?.name || "Booking"}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                              {b.eventDate && (
                                <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(b.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                              )}
                              {b.vendor?.businessName && <span>Vendor: {b.vendor.businessName}</span>}
                              {b.venue?.name && <span>Venue: {b.venue.name}</span>}
                            </div>
                            {b.createdAt && <p className="text-xs text-gray-500 mt-1">Created {new Date(b.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-full px-3 py-1 text-sm font-medium"
                              style={{
                                border: `1px solid ${b.status === "CONFIRMED" ? "#22c55e" : b.status === "CANCELLED" ? "#ef4444" : palette.gold}`,
                                color: b.status === "CONFIRMED" ? "#86efac" : b.status === "CANCELLED" ? "#fca5a5" : palette.goldLight,
                                backgroundColor: b.status === "CONFIRMED" ? "rgba(34,197,94,0.1)" : b.status === "CANCELLED" ? "rgba(239,68,68,0.1)" : `${palette.gold}1a`,
                              }}
                            >
                              {b.status}
                            </span>
                            {b.status === "PENDING" && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateBookingStatus(b.id, "CONFIRMED")}
                                  className="px-2 py-1 rounded text-xs bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                                  className="px-2 py-1 rounded text-xs bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============ MESSAGES TAB ============ */}
            {tab === "messages" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Messages</h2>
                  <span className="text-sm text-gray-400">{unreadMessages} unread</span>
                </div>

                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <MessageSquare size={40} className="mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No messages yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Message list */}
                    <div className="space-y-3 md:col-span-1 max-h-[600px] overflow-y-auto pr-1">
                      {messages.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { loadThread(m.id); if (!m.read) markMessageRead(m.id); }}
                          className={`w-full text-left rounded-lg border ${activeThreadId === m.id ? "border-[#C6A14A]/60 bg-[#C6A14A]/10" : m.read ? "border-white/10 bg-white/5" : "border-[#C6A14A]/50 bg-white/5"} px-3 py-3 transition hover:border-[#C6A14A]/40`}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white font-semibold flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${palette.red}26`, color: palette.goldLight }}>
                                {m.fromName?.slice(0, 2)?.toUpperCase()}
                              </div>
                              {m.fromName}
                            </span>
                            {!m.read && <span className="h-2 w-2 rounded-full bg-[#C6A14A]" />}
                          </div>
                          <p className="text-sm text-gray-300 mt-1 line-clamp-1">{m.subject}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Just now"}</p>
                        </button>
                      ))}
                    </div>

                    {/* Thread view */}
                    <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg min-h-[400px] flex flex-col">
                      {!activeThreadId ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation</div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                            <div>
                              <p className="font-semibold text-white">{messages.find((m) => m.id === activeThreadId)?.fromName}</p>
                              <p className="text-sm text-gray-400">{messages.find((m) => m.id === activeThreadId)?.subject}</p>
                            </div>
                            <button onClick={() => setActiveThreadId(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-[350px]">
                            {threadLoading[activeThreadId] && <p className="text-sm text-gray-400"><Loader2 size={14} className="inline animate-spin mr-1" />Loading…</p>}
                            {(threadMessages[activeThreadId] || []).map((msg) => (
                              <div key={msg.id} className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${msg.senderId === userId ? "ml-auto bg-[#C6A14A]/20 text-white" : "bg-white/10 text-gray-200"}`}>
                                <p>{msg.body}</p>
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {msg.attachments.map((a, i) => (
                                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: palette.goldLight }}>
                                        {a.type === "image" ? "📷 Image" : "🔗 Link"}
                                      </a>
                                    ))}
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                              </div>
                            ))}
                          </div>

                          {/* Attachments preview */}
                          {(attachments[activeThreadId] || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {attachments[activeThreadId].map((a, i) => (
                                <span key={i} className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-gray-300">
                                  {a.type === "image" ? <Image size={12} /> : <Link2 size={12} />} {a.url.slice(0, 30)}…
                                  <button onClick={() => removeAttachment(activeThreadId!, i)} className="text-gray-400 hover:text-white"><X size={12} /></button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Attach form */}
                          {showAttachForm[activeThreadId] && (
                            <div className="flex items-center gap-2 mb-2 p-2 rounded border border-white/10 bg-black/20">
                              <select value={attachType} onChange={(e) => setAttachType(e.target.value)} className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-gray-300">
                                <option value="image">Image</option>
                                <option value="link">Link</option>
                              </select>
                              <input
                                value={attachUrl}
                                onChange={(e) => setAttachUrl(e.target.value)}
                                placeholder="Paste URL…"
                                className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1 text-sm text-white placeholder:text-gray-500"
                              />
                              <button onClick={() => addAttachment(activeThreadId!)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${palette.gold}26`, color: palette.goldLight }}>Add</button>
                              <button onClick={() => setShowAttachForm((p) => ({ ...p, [activeThreadId!]: false }))} className="text-gray-400 hover:text-white"><X size={14} /></button>
                            </div>
                          )}

                          {/* Reply input */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowAttachForm((p) => ({ ...p, [activeThreadId!]: !p[activeThreadId!] }))}
                              className="text-gray-400 hover:text-white"
                            >
                              <Paperclip size={16} />
                            </button>
                            <input
                              value={threadInput[activeThreadId] || ""}
                              onChange={(e) => setThreadInput((p) => ({ ...p, [activeThreadId!]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(activeThreadId!); } }}
                              placeholder="Type a reply…"
                              className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-[#C6A14A]/50 outline-none"
                            />
                            <button
                              onClick={() => sendReply(activeThreadId!)}
                              disabled={conversationSending[activeThreadId!]}
                              className="rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                              style={{ backgroundColor: `${palette.gold}26`, color: palette.goldLight }}
                            >
                              {conversationSending[activeThreadId!] ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============ NOTIFICATIONS TAB ============ */}
            {tab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Notifications</h2>
                  <span className="text-sm text-gray-400">{unreadNotifications.length} unread · {notifications.length} total</span>
                </div>

                {notifications.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <Bell size={40} className="mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No notifications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div key={n.id} className={`flex items-start justify-between gap-3 rounded-xl border ${n.read ? "border-white/10 bg-white/5" : "border-[#C6A14A]/30 bg-[#C6A14A]/5"} px-4 py-3 shadow`}>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.read ? "text-gray-300" : "text-white font-medium"}`}>{n.title}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {n.category && <span className="capitalize">{n.category.toLowerCase()} · </span>}
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                          </p>
                        </div>
                        {!n.read && (
                          <button onClick={() => markNotificationRead(n.id)} className="shrink-0 text-xs px-2 py-1 rounded-md border" style={{ borderColor: `${palette.gold}50`, color: palette.goldLight }}>
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============ PROFILE TAB ============ */}
            {tab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Marketplace Profile</h2>
                  <Link href="/event-planners" className="text-sm flex items-center gap-1 hover:underline" style={{ color: palette.goldLight }}>
                    <ExternalLink size={14} /> View live listing
                  </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg space-y-5">
                  <p className="text-gray-300 text-sm">Manage how you appear to potential clients on the Event Planners marketplace.</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                      <input
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, companyName: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#C6A14A]/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Location</label>
                      <input
                        value={profileForm.location}
                        onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#C6A14A]/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Phone</label>
                      <input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#C6A14A]/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Website</label>
                      <input
                        value={profileForm.website}
                        onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#C6A14A]/50 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Services (comma-separated)</label>
                      <input
                        value={profileForm.services}
                        onChange={(e) => setProfileForm((p) => ({ ...p, services: e.target.value }))}
                        placeholder="Wedding Planning, Corporate Events, Destination Weddings"
                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-[#C6A14A]/50 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Bio</label>
                      <textarea
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#C6A14A]/50 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={saveProfile}
                      disabled={profileSaving}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: palette.gold, color: "#000" }}
                    >
                      {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============ SETTINGS TAB ============ */}
            {tab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Settings</h2>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg space-y-6">
                  {/* Account */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Account</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                        <input
                          value={settingsForm.displayName}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, displayName: e.target.value }))}
                          className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#C6A14A]/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                          value={settingsForm.email}
                          disabled
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notifications preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Notification Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.emailNotifications}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, emailNotifications: e.target.checked }))}
                          className="h-4 w-4 rounded border-white/20 accent-[#C6A14A]"
                        />
                        <span className="text-sm text-gray-300">Email notifications for new bookings and messages</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.smsNotifications}
                          onChange={(e) => setSettingsForm((p) => ({ ...p, smsNotifications: e.target.checked }))}
                          className="h-4 w-4 rounded border-white/20 accent-[#C6A14A]"
                        />
                        <span className="text-sm text-gray-300">SMS notifications for urgent updates</span>
                      </label>
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Danger Zone</h3>
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                      <p className="text-sm text-gray-300 mb-3">Permanently delete your planner account and all associated data.</p>
                      <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30">
                        Delete Account
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        setSettingsSaving(true);
                        try {
                          await supabase.auth.updateUser({ data: { full_name: settingsForm.displayName } });
                          setPlannerName(settingsForm.displayName);
                        } catch { /* ignore */ }
                        setSettingsSaving(false);
                      }}
                      disabled={settingsSaving}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      style={{ backgroundColor: palette.gold, color: "#000" }}
                    >
                      {settingsSaving ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
