"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  Heart,
  ListChecks,
  MapPin,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Link2,
  X,
  PhoneCall,
  Plus,
  Send,
  Settings,
  UserCog,
  Wallet,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { createClient } from "@/lib/supabase/client";

type ApiVenue = {
  id: string;
  name: string;
  slug: string;
  location?: string | null;
  priceRange?: string | null;
  amenities?: string[];
  ownerId?: string | null;
  vendorId?: string | null;
  vendor?: { id: string; user?: { id: string } | null } | null;
  owner?: { id: string } | null;
};

type ApiVendor = {
  id: string;
  companyName: string;
  phone?: string | null;
  services?: string | null;
  user?: { id: string } | null;
  venues?: { id: string; name: string; slug: string; location?: string | null }[];
};

type ApiEvent = {
  id: string;
  title: string;
  date?: string | null;
  status: string;
  budget?: number | null;
  venue?: { id: string; name: string; slug: string; location?: string | null; ownerId?: string | null; vendorId?: string | null } | null;
  organizer?: { id: string; name: string | null; email: string | null } | null;
  eventPlanner?: { id: string; companyName: string | null; phone: string | null; user?: { id: string } | null } | null;
};

type ApiBooking = {
  id: string;
  status: string;
  eventDate: string;
  venue?: { id: string; name: string; slug: string; location?: string | null; ownerId?: string | null; vendorId?: string | null };
  user?: { id: string };
  vendor?: { id: string; user?: { id: string } | null } | null;
  userId?: string;
  vendorId?: string | null;
};

type ApiTask = {
  id: string;
  title: string;
  due?: string | null;
  owner?: string | null;
  status: "OPEN" | "DONE";
  priority: "HIGH" | "MEDIUM" | "LOW";
};

type ApiMessage = {
  id: string;
  fromName: string;
  subject: string;
  preview?: string | null;
  read: boolean;
  createdAt?: string;
};

type ApiNotification = {
  id: string;
  title: string;
  category?: string | null;
  read: boolean;
  createdAt?: string;
};

type ApiBudgetLine = {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  owner?: string | null;
  status: string;
};

type ApiCalendarSlot = {
  id: string;
  name: string;
  date: string;
  location?: string | null;
  type?: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "events"
    | "favorites"
    | "bookings"
    | "messages"
    | "calendar"
    | "tasks"
    | "budget"
    | "notifications"
    | "settings"
    | "profile"
  >("overview");

  const [user, setUser] = useState<{
    id?: string;
    name: string;
    email: string;
    avatar: string;
    role?: string | null;
    picture?: string | null;
    vendorProfileId?: string | null;
    eventPlannerProfileId?: string | null;
  }>({ name: "", email: "", avatar: "" });
  const hydratedProfile = useRef(false);
  const seededTasks = useRef(false);
  const seededNotifications = useRef(false);
  const seededBudget = useRef(false);
  const seededMessages = useRef(false);

  const [eventsData, setEventsData] = useState<ApiEvent[]>([]);
  const [vendorsData, setVendorsData] = useState<ApiVendor[]>([]);
  const [bookingsData, setBookingsData] = useState<ApiBooking[]>([]);
  const [venuesData, setVenuesData] = useState<ApiVenue[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<ApiCalendarSlot[]>([]);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ name: "", date: "" });
  const [removedVenueIds, setRemovedVenueIds] = useState<Set<string>>(new Set());
  const [removedVendorIds, setRemovedVendorIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<
    { id: string; from: string; subject: string; preview: string; time: string; unread: boolean }[]
  >([]);

  const [threadMessages, setThreadMessages] = useState<Record<string, any[]>>({});
  const [threadLoading, setThreadLoading] = useState<Record<string, boolean>>({});
  const [threadError, setThreadError] = useState<Record<string, string | null>>({});
  const [threadInput, setThreadInput] = useState<Record<string, string>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [msgAttachments, setMsgAttachments] = useState<Record<string, Array<{ type: string; url: string }>>>({});
  const [showMsgAttachForm, setShowMsgAttachForm] = useState<Record<string, boolean>>({});
  const [msgAttachUrl, setMsgAttachUrl] = useState("");
  const [msgAttachType, setMsgAttachType] = useState("image");

  const [tasks, setTasks] = useState<
    { id: string; title: string; due: string; owner: string; status: "Open" | "Done"; priority: "High" | "Medium" | "Low" }[]
  >([]);

  const [taskFilter, setTaskFilter] = useState<"all" | "open" | "done">(
    "all"
  );

  const filteredTasks = useMemo(() => {
    if (taskFilter === "all") return tasks;
    if (taskFilter === "done") return tasks.filter((t) => t.status === "Done");
    return tasks.filter((t) => t.status !== "Done");
  }, [taskFilter, tasks]);

  const filteredEvents = useMemo(() => {
    if (!user.id) return eventsData;
    switch (user.role) {
      case "ADMIN":
        return eventsData;
      case "VENDOR":
        return eventsData.filter(
          (event) =>
            event.venue?.vendorId === user.vendorProfileId ||
            event.venue?.ownerId === user.id
        );
      case "VENUE":
        return eventsData.filter((event) => event.venue?.ownerId === user.id);
      case "EVENT_PLANNER":
        return eventsData.filter(
          (event) => event.eventPlanner?.id === user.eventPlannerProfileId
        );
      default:
        return eventsData.filter((event) => event.organizer?.id === user.id);
    }
  }, [eventsData, user]);

  const filteredBookings = useMemo(() => {
    if (!user.id) return bookingsData;
    switch (user.role) {
      case "ADMIN":
        return bookingsData;
      case "VENDOR":
        return bookingsData.filter(
          (b) =>
            b.vendorId === user.vendorProfileId ||
            b.venue?.vendorId === user.vendorProfileId ||
            b.venue?.ownerId === user.id
        );
      case "VENUE":
        return bookingsData.filter((b) => b.venue?.ownerId === user.id);
      default:
        return bookingsData.filter(
          (b) =>
            b.userId === user.id ||
            b.user?.id === user.id ||
            (!!user.email && b.user && (b.user as any).email === user.email)
        );
    }
  }, [bookingsData, user]);

  const filteredVenues = useMemo(() => venuesData, [venuesData]);

  const filteredVendors = useMemo(() => vendorsData, [vendorsData]);

  const visibleVenues = useMemo(
    () => filteredVenues.filter((v) => !removedVenueIds.has(v.id)),
    [filteredVenues, removedVenueIds]
  );

  const visibleVendors = useMemo(
    () => filteredVendors.filter((v) => !removedVendorIds.has(v.id)),
    [filteredVendors, removedVendorIds]
  );

  const upcomingEvents = useMemo(() => {
    return [...filteredEvents]
      .filter((event) => event.date)
      .sort(
        (a, b) =>
          new Date(a.date || 0).getTime() -
          new Date(b.date || 0).getTime()
      )
      .slice(0, 5);
  }, [filteredEvents]);

  const confirmedBookings = useMemo(() => {
    return filteredBookings.filter((booking) => booking.status === "CONFIRMED").length;
  }, [filteredBookings]);

  const calendarEvents = useMemo(() => {
    const bookingEvents = filteredBookings.map((booking) => ({
      id: booking.id,
      name: booking.venue?.name || "Venue booking",
      date: booking.eventDate,
      location: booking.venue?.location || "",
      type: booking.status,
    }));

    const slotEvents = calendarSlots.map((slot) => ({
      id: slot.id,
      name: slot.name,
      date: slot.date,
      location: slot.location || "",
      type: slot.type || "Custom",
    }));

    return [...bookingEvents, ...slotEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredBookings, calendarSlots]);

  const growthSeries = useMemo(() => {
    const now = new Date();
    const months: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const count = filteredBookings.filter((b) => {
        const bd = new Date(b.eventDate);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      }).length;
      months.push({
        label: d.toLocaleString("en-US", { month: "short" }),
        value: count,
      });
    }
    return months;
  }, [filteredBookings]);

  const growthPath = useMemo(() => {
    if (growthSeries.length === 0) return { path: "", fill: "" };
    const maxVal = Math.max(...growthSeries.map((p) => p.value), 1);
    const width = 216;
    const height = 120;
    const baseY = height;
    const stepX = growthSeries.length > 1 ? width / (growthSeries.length - 1) : width;

    const points = growthSeries.map((p, idx) => {
      const x = idx * stepX;
      const y = baseY - (p.value / maxVal) * 80; // scale to 80px height
      return { x, y };
    });

    const path = points
      .map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");

    const fillPath = `${path} L ${width} ${baseY} L 0 ${baseY} Z`;
    return { path, fill: fillPath, points } as any;
  }, [growthSeries]);

  const derivedTasks = useMemo(() => {
    return filteredBookings.map((b) => {
      const due = b.eventDate || new Date().toISOString();
      const title = b.status === "CONFIRMED"
        ? `Finalize booking for ${b.venue?.name || "venue"}`
        : `Confirm booking for ${b.venue?.name || "venue"}`;
      return {
        id: b.id,
        title,
        due,
        owner: user.name || "You",
        status: b.status === "CONFIRMED" ? "Done" : "Open",
        priority: "High" as const,
      };
    });
  }, [filteredBookings, user.name]);

  const derivedNotifications = useMemo(() => {
    return filteredBookings.map((b) => ({
      id: b.id,
      title: `${b.status === "CONFIRMED" ? "Confirmed" : "Pending"} booking for ${b.venue?.name || "venue"}`,
      time: new Date(b.eventDate).toLocaleString("en-IN", { month: "short", day: "numeric" }),
      read: b.status === "CONFIRMED",
      category: b.status,
    }));
  }, [filteredBookings]);

  const derivedBudgetLines = useMemo(() => {
    return filteredEvents
      .filter((e) => typeof e.budget === "number")
      .map((e) => ({
        id: e.id,
        category: e.title,
        allocated: e.budget || 0,
        spent: 0,
        owner: e.organizer?.name || user.name || "",
        status: e.status,
      }));
  }, [filteredEvents, user.name]);

  const derivedMessages = useMemo(() => {
    return filteredVendors.map((v) => ({
      id: v.id,
      from: v.companyName,
      subject: "New inquiry",
      preview: v.services || "Message from vendor",
      time: "Just now",
      unread: true,
    }));
  }, [filteredVendors]);

  const [budgetLines, setBudgetLines] = useState<
    { id: string; category: string; allocated: number; spent: number; owner?: string; status: string }[]
  >([]);

  const budgetTotals = useMemo(() => {
    const allocated = budgetLines.reduce((sum, line) => sum + line.allocated, 0);
    const spent = budgetLines.reduce((sum, line) => sum + line.spent, 0);
    return { allocated, spent, remaining: allocated - spent };
  }, [budgetLines]);

  const [notifications, setNotifications] = useState<
    { id: string; title: string; time: string; read: boolean; category?: string }[]
  >([]);

  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    digest: true,
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    role: "Bride",
    dietary: "Vegetarian",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const role = data.user?.user_metadata?.role as string | undefined;
      if (role === "vendor") {
        router.replace("/vendor/dashboard");
        return;
      }
      if (role === "venue-owner") {
        router.replace("/venue/dashboard");
        return;
      }
      if (role === "planner") {
        router.replace("/event-planner/dashboard");
        return;
      }
    })();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const u = data.user as { id?: string; name?: string; email?: string; role?: string | null; picture?: string | null; vendorProfileId?: string | null; eventPlannerProfileId?: string | null } | null;
        if (!active || !u) return;
        const avatar = (u.name || u.email || "").charAt(0).toUpperCase();
        setUser({
          id: u.id,
          name: u.name ?? "",
          email: u.email ?? "",
          role: u.role ?? null,
          picture: u.picture ?? null,
          vendorProfileId: u.vendorProfileId ?? null,
          eventPlannerProfileId: u.eventPlannerProfileId ?? null,
          avatar,
        });

        if (!hydratedProfile.current) {
          setProfile((prev) => ({
            ...prev,
            name: u.name ?? prev.name,
            email: u.email ?? prev.email,
            phone: prev.phone || "",
            city: prev.city || "",
          }));
          hydratedProfile.current = true;
        }
      } catch (e) {
        console.error("Failed to load user", e);
      }
    };

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [eventsRes, venuesRes, vendorsRes, bookingsRes, tasksRes, messagesRes, notificationsRes, budgetLinesRes, slotsRes] =
          await Promise.all([
            fetch("/api/events", { cache: "no-store" }),
            fetch("/api/venues", { cache: "no-store" }),
            fetch("/api/vendors", { cache: "no-store" }),
            fetch("/api/bookings", { cache: "no-store", credentials: "include" }),
            fetch("/api/tasks", { cache: "no-store" }),
            fetch("/api/messages", { cache: "no-store" }),
            fetch("/api/notifications", { cache: "no-store" }),
            fetch("/api/budget-lines", { cache: "no-store" }),
            fetch("/api/calendar/slots", { cache: "no-store" }),
          ]);

        if (!active) return;

        const responses = [eventsRes, venuesRes, vendorsRes, bookingsRes, tasksRes, messagesRes, notificationsRes, budgetLinesRes, slotsRes];
        if (!responses.every((r) => r.ok)) {
          throw new Error("One or more dashboard requests failed");
        }

        const [eventsData, venuesData, vendorsData, bookingsData, tasksData, messagesData, notificationsData, budgetLinesData, slotsData] =
          await Promise.all([
            eventsRes.json(),
            venuesRes.json(),
            vendorsRes.json(),
            bookingsRes.json(),
            tasksRes.json(),
            messagesRes.json(),
            notificationsRes.json(),
            budgetLinesRes.json(),
            slotsRes.json(),
          ]);

        setEventsData(Array.isArray(eventsData) ? eventsData : []);
        setVenuesData(Array.isArray(venuesData) ? venuesData : []);
        setVendorsData(Array.isArray(vendorsData) ? vendorsData : []);
        setBookingsData(Array.isArray(bookingsData) ? bookingsData : []);

        const mappedTasks = Array.isArray(tasksData)
          ? (tasksData as ApiTask[]).map((t) => ({
              id: t.id,
              title: t.title,
              due: t.due || new Date().toISOString(),
              owner: t.owner || user.name || "You",
              status: (t.status === "DONE" ? "Done" : "Open") as "Open" | "Done",
              priority:
                (t.priority === "HIGH" ? "High" : t.priority === "LOW" ? "Low" : "Medium") as "High" | "Medium" | "Low",
            }))
          : [];

        const mappedMessages = Array.isArray(messagesData)
          ? (messagesData as ApiMessage[]).map((m) => ({
              id: m.id,
              from: m.fromName,
              subject: m.subject,
              preview: m.preview || "",
              time: m.createdAt
                ? new Date(m.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                : "Just now",
              unread: !m.read,
            }))
          : [];

        const mappedNotifications = Array.isArray(notificationsData)
          ? (notificationsData as ApiNotification[]).map((n) => ({
              id: n.id,
              title: n.title,
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric" })
                : "Just now",
              read: n.read,
              category: n.category || "Update",
            }))
          : [];

        const mappedBudget = Array.isArray(budgetLinesData)
          ? (budgetLinesData as ApiBudgetLine[]).map((b) => ({
              id: b.id,
              category: b.category,
              allocated: b.allocated,
              spent: b.spent,
              owner: b.owner || user.name || "",
              status: b.status,
            }))
          : [];

        const mappedSlots = Array.isArray(slotsData) ? (slotsData as ApiCalendarSlot[]) : [];

        setTasks(mappedTasks);
        setMessages(mappedMessages);
        setNotifications(mappedNotifications);
        setBudgetLines(mappedBudget);
        setCalendarSlots(mappedSlots);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
        if (active) setError("Could not load latest dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && tasks.length === 0 && derivedTasks.length > 0 && !seededTasks.current) {
      seededTasks.current = true;
      (async () => {
        try {
          const created = await Promise.all(
            derivedTasks.map(async (task) => {
              const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: task.title,
                  due: task.due,
                  priority: task.priority.toUpperCase(),
                  owner: task.owner,
                }),
              });
              if (!res.ok) throw new Error("Task seed failed");
              const saved = (await res.json()) as ApiTask;
              return {
                id: saved.id,
                title: saved.title,
                due: saved.due || task.due,
                owner: saved.owner || task.owner,
                status: (saved.status === "DONE" ? "Done" : "Open") as "Open" | "Done",
                priority: (saved.priority === "HIGH" ? "High" : saved.priority === "LOW" ? "Low" : "Medium") as "High" | "Medium" | "Low",
              };
            })
          );
          setTasks(created);
        } catch (err) {
          console.error(err);
          setTasks(derivedTasks as typeof tasks);
        }
      })();
    }
  }, [loading, derivedTasks, tasks.length]);

  useEffect(() => {
    if (!loading && notifications.length === 0 && derivedNotifications.length > 0 && !seededNotifications.current) {
      seededNotifications.current = true;
      (async () => {
        try {
          const created = await Promise.all(
            derivedNotifications.map(async (n) => {
              const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: n.title, category: n.category, read: n.read }),
              });
              if (!res.ok) throw new Error("Notification seed failed");
              const saved = (await res.json()) as ApiNotification;
              return {
                id: saved.id,
                title: saved.title,
                time: saved.createdAt
                  ? new Date(saved.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric" })
                  : n.time,
                read: saved.read,
                category: saved.category || n.category,
              };
            })
          );
          setNotifications(created);
        } catch (err) {
          console.error(err);
          setNotifications(derivedNotifications);
        }
      })();
    }
  }, [loading, derivedNotifications, notifications.length]);

  useEffect(() => {
    if (!loading && budgetLines.length === 0 && derivedBudgetLines.length > 0 && !seededBudget.current) {
      seededBudget.current = true;
      (async () => {
        try {
          const created = await Promise.all(
            derivedBudgetLines.map(async (line) => {
              const res = await fetch("/api/budget-lines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  category: line.category,
                  allocated: line.allocated,
                  spent: line.spent,
                  status: line.status,
                  owner: line.owner,
                }),
              });
              if (!res.ok) throw new Error("Budget seed failed");
              const saved = (await res.json()) as ApiBudgetLine;
              return {
                id: saved.id,
                category: saved.category,
                allocated: saved.allocated,
                spent: saved.spent,
                owner: saved.owner || line.owner,
                status: saved.status,
              };
            })
          );
          setBudgetLines(created);
        } catch (err) {
          console.error(err);
          setBudgetLines(derivedBudgetLines);
        }
      })();
    }
  }, [loading, derivedBudgetLines, budgetLines.length]);

  useEffect(() => {
    if (!loading && messages.length === 0 && derivedMessages.length > 0 && !seededMessages.current) {
      seededMessages.current = true;
      (async () => {
        try {
          const created = await Promise.all(
            derivedMessages.map(async (message) => {
              const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fromName: message.from,
                  subject: message.subject,
                  preview: message.preview,
                  body: message.preview,
                }),
              });
              if (!res.ok) throw new Error("Message seed failed");
              const saved = (await res.json()) as ApiMessage;
              return {
                id: saved.id,
                from: saved.fromName,
                subject: saved.subject,
                preview: saved.preview || message.preview,
                time: saved.createdAt
                  ? new Date(saved.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                  : message.time,
                unread: !saved.read,
              };
            })
          );
          setMessages(created);
        } catch (err) {
          console.error(err);
          setMessages(derivedMessages);
        }
      })();
    }
  }, [loading, derivedMessages, messages.length]);

  const unreadMessages = messages.filter((m) => m.unread).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "DRAFT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "ARCHIVED":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Planning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const removeVenue = (id: string) =>
    setRemovedVenueIds((prev) => new Set([...prev, id]));

  const removeVendor = (id: string) =>
    setRemovedVendorIds((prev) => new Set([...prev, id]));

  const toggleTask = async (id: string) => {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;
    const nextStatus = existing.status === "Done" ? "OPEN" : "DONE";
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus === "DONE" ? "Done" : "Open" } : t)));

    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    }).catch((err) => console.error("Failed to update task", err));
  };

  const markMessageRead = async (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    }).catch((err) => console.error("Failed to mark message read", err));
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    }).catch((err) => console.error("Failed to mark notification read", err));
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

  const togglePreference = (key: keyof typeof preferences) =>
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

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

  const updateProfile = (key: keyof typeof profile, value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const markBudgetPaid = async (id: string) => {
    const existing = budgetLines.find((b) => b.id === id);
    if (!existing) return;

    setBudgetLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, status: "Paid", spent: line.spent || line.allocated } : line
      )
    );

    await fetch("/api/budget-lines", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Paid", spent: existing.allocated }),
    }).catch((err) => console.error("Failed to reconcile budget", err));
  };

  const addCalendarSlot = () => {
    setSlotForm({ name: "", date: "" });
    setSlotModalOpen(true);
  };

  const saveCalendarSlot = async () => {
    const name = slotForm.name.trim();
    const dateInput = slotForm.date.trim();
    if (!name || !dateInput) return;

    const parsedDate = new Date(dateInput);
    if (Number.isNaN(parsedDate.getTime())) return;

    const res = await fetch("/api/calendar/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date: parsedDate.toISOString() }),
    });

    if (res.ok) {
      const slot: ApiCalendarSlot = await res.json();
      setCalendarSlots((prev) => [...prev, slot]);
      setSlotModalOpen(false);
    }
  };

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-serif text-white mb-2">
                    Welcome back, <span className="text-[#C6A14A]">{user.name}</span>
                  </h1>
                  <p className="text-gray-400">Manage your events and bookings</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative"
                  >
                    <Bell size={20} className="text-white" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 px-2 py-0.5 text-[11px] rounded-full bg-red-500 text-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Settings size={20} className="text-white" />
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="w-10 h-10 bg-[#C6A14A] rounded-full flex items-center justify-center font-semibold text-black"
                  >
                    {user.avatar || "?"}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["overview", "events", "favorites", "bookings", "messages", "calendar", "tasks", "budget", "notifications", "settings", "profile"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as typeof activeTab)}
                      className={`px-5 py-3 rounded-lg font-semibold capitalize whitespace-nowrap transition-all border ${
                        activeTab === tab
                          ? "bg-[#C6A14A] text-black border-[#C6A14A]"
                          : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </motion.div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                    <Calendar className="w-8 h-8 text-[#C6A14A] mb-3" />
                    <p className="text-gray-400 text-sm mb-1">Upcoming events</p>
                    <p className="text-3xl font-bold text-white">
                      {filteredEvents.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                    <Heart className="w-8 h-8 text-[#C6A14A] mb-3" />
                    <p className="text-gray-400 text-sm mb-1">Saved items</p>
                    <p className="text-3xl font-bold text-white">
                      {visibleVenues.length + visibleVendors.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                    <MessageSquare className="w-8 h-8 text-[#C6A14A] mb-3" />
                    <p className="text-gray-400 text-sm mb-1">Unread messages</p>
                    <p className="text-3xl font-bold text-white">{unreadMessages}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                    <DollarSign className="w-8 h-8 text-[#C6A14A] mb-3" />
                    <p className="text-gray-400 text-sm mb-1">Total budget</p>
                    <p className="text-3xl font-bold text-white">
                      {formatAmount(budgetTotals.allocated)}
                    </p>
                  </div>
                </motion.div>

                {/* Growth Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Growth overview</p>
                      <h3 className="text-2xl font-serif text-white">Engagement & bookings</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-300 text-sm border border-green-500/30">
                        +18% vs last month
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] text-sm border border-[#C6A14A]/30">
                        Leads ↑
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <svg viewBox="0 0 220 140" className="w-full h-40">
                        <defs>
                          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C6A14A" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#C6A14A" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        {growthPath.path && (
                          <>
                            <path d={growthPath.fill} fill="url(#growthFill)" stroke="none" />
                            <path
                              d={growthPath.path}
                              fill="none"
                              stroke="#C6A14A"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            {growthPath.points?.map((pt: { x: number; y: number }, idx: number) => (
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
                        <p className="text-2xl font-semibold text-white">{filteredVendors.length}</p>
                        <p className="text-sm text-green-300">Vendor profiles</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">Confirmed bookings</p>
                        <p className="text-2xl font-semibold text-white">{confirmedBookings}</p>
                        <p className="text-sm text-green-300">Status: confirmed</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-gray-400 text-sm">Avg bookings/month</p>
                        <p className="text-2xl font-semibold text-white">
                          {growthSeries.length ?
                            (growthSeries.reduce((s, p) => s + p.value, 0) / growthSeries.length).toFixed(1) : "0"}
                        </p>
                        <p className="text-sm text-[#C6A14A]">Rolling 6 months</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Upcoming Events */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-white">Upcoming events</h2>
                    <Link href="/planner">
                      <button className="px-4 py-2 bg-[#C6A14A] hover:bg-[#E8C56B] text-black rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <Plus size={18} />
                        New event
                      </button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {upcomingEvents.length === 0 && (
                      <p className="text-gray-400">No scheduled events yet.</p>
                    )}
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white/5 rounded-lg p-5 border border-white/10"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">
                                {event.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  event.status
                                )}`}
                              >
                                {event.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                              {event.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {new Date(event.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                              {event.venue?.name && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {event.venue.name}
                                  {event.venue.location ? ` • ${event.venue.location}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="lg:ml-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                            View details
                            <ChevronRight size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm text-gray-300">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 mb-1">Budget</span>
                            <span className="font-semibold text-white">
                              {event.budget ? formatAmount(event.budget) : "Not set"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 mb-1">Organizer</span>
                            <span className="font-semibold text-white">
                              {event.organizer?.name || event.organizer?.email || "—"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 mb-1">Planner</span>
                            <span className="font-semibold text-white">
                              {event.eventPlanner?.companyName || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Messages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <h2 className="text-2xl font-serif text-white mb-6">Recent messages</h2>
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-400">No messages yet.</p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {messages.slice(0, 3).map((message) => (
                          <div
                            key={message.id}
                            className={`bg-white/5 rounded-lg p-4 border transition-colors cursor-pointer ${
                              message.unread
                                ? "border-[#C6A14A]/50 hover:border-[#C6A14A]"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            onClick={() => markMessageRead(message.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-semibold">{message.from}</h4>
                                {message.unread && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                              </div>
                              <span className="text-xs text-gray-500">{message.time}</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{message.subject}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{message.preview}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveTab("messages")}
                        className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                      >
                        View all messages
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center py-12 bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl border border-[#C6A14A]/20">
                  <Calendar className="w-16 h-16 text-[#C6A14A] mx-auto mb-4" />
                  <h3 className="text-xl font-serif text-white mb-2">Event management coming soon</h3>
                  <p className="text-gray-400">Detailed event management features will be available here</p>
                </div>
              </motion.div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                  <h2 className="text-2xl font-serif text-white mb-6">Saved venues</h2>
                  {visibleVenues.length === 0 && (
                    <p className="text-sm text-gray-400">No venues saved yet.</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleVenues.map((venue) => (
                      <div
                        key={venue.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#C6A14A] transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white group-hover:text-[#C6A14A] transition-colors">
                            {venue.name}
                          </h3>
                          <Heart size={20} className="text-red-500 fill-red-500" />
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{venue.location || "Location coming soon"}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400">Slug: {venue.slug}</span>
                          <span className="text-[#C6A14A] font-semibold">{venue.priceRange || "Pricing TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Link
                            href={`/venues/${venue.id}`}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15 hover:bg-white/20 transition-colors flex-1 text-center"
                          >
                            View
                          </Link>
                          <button className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30 flex items-center justify-center gap-1 flex-1">
                            <PhoneCall size={14} /> Contact
                          </button>
                          <button
                            onClick={() => removeVenue(venue.id)}
                            className="px-3 py-2 bg-red-500/15 text-red-200 rounded-lg border border-red-500/30 flex items-center justify-center gap-1"
                            aria-label="Remove saved venue"
                          >
                            <BookmarkCheck size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                  <h2 className="text-2xl font-serif text-white mb-6">Saved vendors</h2>
                  {visibleVendors.length === 0 && (
                    <p className="text-sm text-gray-400">No vendors saved yet.</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-[#C6A14A] transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-[#C6A14A]/20 text-[#C6A14A] px-3 py-1 rounded-full">
                            {vendor.services || "Services"}
                          </span>
                          <Heart size={20} className="text-red-500 fill-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#C6A14A] transition-colors">
                          {vendor.companyName}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">{vendor.phone || "Contact coming soon"}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Link
                            href={`/vendors/${vendor.id}`}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15 hover:bg-white/20 transition-colors flex-1 text-center"
                          >
                            View
                          </Link>
                          <button className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30 flex items-center justify-center gap-1 flex-1">
                            <Send size={14} /> Message
                          </button>
                          <button
                            onClick={() => removeVendor(vendor.id)}
                            className="px-3 py-2 bg-red-500/15 text-red-200 rounded-lg border border-red-500/30 flex items-center justify-center gap-1"
                            aria-label="Remove saved vendor"
                          >
                            <BookmarkCheck size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif text-white">My Bookings</h2>
                  <span className="text-sm text-gray-300">{filteredBookings.length} bookings</span>
                </div>
                {filteredBookings.length === 0 && <p className="text-gray-400">No bookings yet.</p>}
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold text-lg">{booking.venue?.name || "Venue"}</p>
                          <p className="text-gray-300 text-sm">{booking.venue?.location || "Location"} · {new Date(booking.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                          {booking.vendor && <p className="text-gray-400 text-xs mt-1">Vendor: {(booking.vendor as any).companyName || "—"}</p>}
                          <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs border ${booking.status === "CONFIRMED" ? "border-green-500/30 text-green-300 bg-green-500/10" : booking.status === "CANCELLED" ? "border-red-500/30 text-red-300 bg-red-500/10" : "border-[#C6A14A]/30 text-[#C6A14A] bg-[#C6A14A]/10"}`}>{booking.status}</span>
                        </div>
                        <button
                          onClick={() => {
                            const next = activeThreadId === booking.id ? null : booking.id;
                            setActiveThreadId(next);
                            if (next && !threadMessages[booking.id] && !threadLoading[booking.id]) {
                              loadThread(booking.id);
                            }
                          }}
                          className="self-start px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          {activeThreadId === booking.id ? "Hide messages" : "Messages"}
                        </button>
                      </div>

                      {activeThreadId === booking.id && (
                        <div className="rounded-lg border border-white/10 bg-black/30 p-4 space-y-3">
                          {threadError[booking.id] && (
                            <div className="text-xs text-red-200">{threadError[booking.id]}</div>
                          )}
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
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
                            {threadLoading[booking.id] && <div className="text-xs text-gray-300">Loading messages…</div>}
                            {!threadLoading[booking.id] && (threadMessages[booking.id] || []).length === 0 && (
                              <div className="text-xs text-gray-300">No messages yet. Send the first message!</div>
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
                              placeholder="Type a message…"
                              value={threadInput[booking.id] || ""}
                              onChange={(e) => setThreadInput((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendThreadMessage(booking.id); } }}
                            />
                            <button
                              onClick={() => sendThreadMessage(booking.id)}
                              disabled={threadLoading[booking.id]}
                              className="px-4 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif text-white">Messages</h2>
                  <span className="text-sm text-gray-300">{unreadMessages} unread</span>
                </div>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-400">No messages yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`bg-white/5 rounded-lg p-5 border transition-colors ${
                          message.unread
                            ? "border-[#C6A14A]/50 hover:border-[#C6A14A]"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#C6A14A]/20 rounded-full flex items-center justify-center">
                              <MessageSquare size={20} className="text-[#C6A14A]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold">{message.from}</h4>
                                {message.unread && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                              </div>
                              <p className="text-sm text-gray-500">{message.time}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => markMessageRead(message.id)}
                            className="text-xs px-3 py-1 rounded-full border border-white/15 text-white hover:bg-white/10"
                          >
                            Mark read
                          </button>
                        </div>
                        <h5 className="text-white font-semibold mb-2">{message.subject}</h5>
                        <p className="text-sm text-gray-400 mb-3">{message.preview}</p>
                        <div className="flex gap-2 text-xs">
                          <button className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15 hover:bg-white/20 flex items-center gap-1">
                            <Send size={14} /> Quick reply
                          </button>
                          <button className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30 flex items-center gap-1">
                            <PhoneCall size={14} /> Call back
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Booking conversations</h3>
                    <span className="text-xs text-gray-300">{filteredBookings.length} bookings</span>
                  </div>
                  {filteredBookings.length === 0 && <p className="text-sm text-gray-400">No bookings yet.</p>}
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{booking.venue?.name || "Venue"}</p>
                          <p className="text-gray-300 text-sm">{booking.venue?.location || "Location"} · {new Date(booking.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                          <span className="inline-flex mt-1 px-3 py-1 rounded-full text-xs border border-white/20 text-[#C6A14A]">{booking.status}</span>
                        </div>
                        <button
                          onClick={() => {
                            const next = activeThreadId === booking.id ? null : booking.id;
                            setActiveThreadId(next);
                            if (next && !threadMessages[booking.id] && !threadLoading[booking.id]) {
                              loadThread(booking.id);
                            }
                          }}
                          className="px-3 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                        >
                          {activeThreadId === booking.id ? "Hide" : "Open"} messages
                        </button>
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
                            {threadLoading[booking.id] && <div className="text-xs text-gray-300">Loading messages…</div>}
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
                              placeholder="Type a message"
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
                </div>
              </motion.div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Schedule</p>
                    <h2 className="text-2xl font-serif text-white">Calendar & milestones</h2>
                  </div>
                  <button
                    onClick={addCalendarSlot}
                    className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Add slot
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {calendarEvents.length === 0 && (
                    <p className="text-sm text-gray-400">No bookings scheduled.</p>
                  )}
                  {calendarEvents.map((event) => (
                    <div key={event.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span className="px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">
                          {event.type}
                        </span>
                        <span className="flex items-center gap-1 text-gray-300">
                          <Clock3 size={14} />
                          {new Date(event.date).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold">{event.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin size={14} /> {event.location || "Location pending"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span className="px-2 py-1 rounded-full bg-white/10 border border-white/15">
                          {event.type}
                        </span>
                        <button className="px-3 py-1 bg-white/10 text-white rounded-lg border border-white/15 hover:bg-white/20 text-xs">
                          Add to calendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20 space-y-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-300">Planner tasks</p>
                    <h2 className="text-2xl font-serif text-white">Checklist & owners</h2>
                  </div>
                  <div className="flex gap-2 text-sm">
                    {["all", "open", "done"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter as typeof taskFilter)}
                        className={`px-3 py-2 rounded-lg border ${
                          taskFilter === filter
                            ? "bg-[#C6A14A] text-black border-[#C6A14A]"
                            : "bg-white/10 text-white border-white/15 hover:bg-white/20"
                        }`}
                      >
                        {filter === "all" ? "All" : filter === "open" ? "Open" : "Done"}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-gray-400">No tasks yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                      <div key={task.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15">
                            {task.priority} priority
                          </span>
                          <span className="text-xs text-gray-300 flex items-center gap-1">
                            <Clock3 size={14} />
                            {new Date(task.due).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold">{task.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <span>Owner: {task.owner}</span>
                          <span className={`px-2 py-1 rounded-full border text-xs ${
                            task.status === "Done"
                              ? "border-green-400/40 text-green-300"
                              : "border-yellow-400/40 text-yellow-200"
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-full py-2 rounded-lg border flex items-center justify-center gap-2 text-sm ${
                            task.status === "Done"
                              ? "bg-green-500/15 text-green-200 border-green-500/30"
                              : "bg-white/10 text-white border-white/15 hover:bg-white/20"
                          }`}
                        >
                          <CheckCircle2 size={16} />
                          {task.status === "Done" ? "Mark as open" : "Mark done"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Budget Tab */}
            {activeTab === "budget" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20 space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-300">Budget tracker</p>
                    <h2 className="text-2xl font-serif text-white">Allocated vs. spent</h2>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-2 rounded-lg bg-white/5 text-gray-200 border border-white/10 flex items-center gap-2">
                      <Wallet size={16} /> Allocated {formatAmount(budgetTotals.allocated)}
                    </span>
                    <span className="px-3 py-2 rounded-lg bg-white/5 text-gray-200 border border-white/10 flex items-center gap-2">
                      <DollarSign size={16} /> Spent {formatAmount(budgetTotals.spent)}
                    </span>
                  </div>
                </div>

                {budgetLines.length === 0 ? (
                  <p className="text-sm text-gray-400">No budget lines yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgetLines.map((line) => {
                      const used = Math.min(100, Math.round((line.spent / line.allocated) * 100));
                      return (
                        <div key={line.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">{line.category}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15">
                              {line.owner || ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{line.status}</p>
                          <div className="flex items-center justify-between text-sm text-gray-300">
                            <span>Allocated {formatAmount(line.allocated)}</span>
                            <span>Spent {formatAmount(line.spent)}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#C6A14A] rounded-full" style={{ width: `${used}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-300">
                            <span>Remaining {formatAmount(line.allocated - line.spent)}</span>
                            <span>{used}% used</span>
                          </div>
                          <button
                            onClick={() => markBudgetPaid(line.id)}
                            className="w-full py-2 rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/20 text-sm"
                          >
                            Mark paid / reconcile
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Alerts & updates</p>
                    <h2 className="text-2xl font-serif text-white">Notifications</h2>
                  </div>
                  <span className="text-sm text-gray-300">{unreadNotifications} unread</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors bg-white/5 ${
                        notification.read
                          ? "border-white/10"
                          : "border-[#C6A14A]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] text-xs border border-[#C6A14A]/30">
                          {notification.category}
                        </span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                      <p className="text-white font-semibold mb-3">{notification.title}</p>
                      <div className="flex items-center gap-2 text-xs">
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationRead(notification.id)}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15 hover:bg-white/20"
                          >
                            Mark read
                          </button>
                        )}
                        <button className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30 flex items-center gap-1">
                          <BellRing size={14} /> Snooze 1h
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Preferences</p>
                    <h2 className="text-2xl font-serif text-white">Settings</h2>
                  </div>
                  <span className="text-sm text-gray-400">Auto-saved</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Bell className="text-[#C6A14A]" />
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    {[{ key: "email", label: "Email alerts" }, { key: "push", label: "Push notifications" }, { key: "sms", label: "SMS for critical updates" }, { key: "digest", label: "Weekly digest" }].map(
                      (item) => (
                        <label key={item.key} className="flex items-center gap-3 text-sm text-gray-200">
                          <input
                            type="checkbox"
                            checked={preferences[item.key as keyof typeof preferences]}
                            onChange={() => togglePreference(item.key as keyof typeof preferences)}
                            className="accent-[#C6A14A]"
                          />
                          {item.label}
                        </label>
                      )
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="text-[#C6A14A]" />
                      <h3 className="text-white font-semibold">Planning preferences</h3>
                    </div>
                    <p className="text-sm text-gray-300">Control reminders and sharing</p>
                    <div className="space-y-2 text-sm text-gray-200">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="accent-[#C6A14A]" defaultChecked />
                        Share availability with vendors
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="accent-[#C6A14A]" defaultChecked />
                        Remind me 24h before meetings
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="accent-[#C6A14A]" />
                        Show budgets to family view
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Account</p>
                    <h2 className="text-2xl font-serif text-white">Profile & preferences</h2>
                  </div>
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <UserCog size={16} /> Editable fields
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[{ key: "name", label: "Full name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "city", label: "City" }].map(
                    (field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm text-gray-300">{field.label}</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                          value={profile[field.key as keyof typeof profile]}
                          onChange={(e) => updateProfile(field.key as keyof typeof profile, e.target.value)}
                        />
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Role</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      value={profile.role}
                      onChange={(e) => updateProfile("role", e.target.value)}
                    >
                      {["Bride", "Groom", "Planner", "Family"].map((role) => (
                        <option key={role} value={role} className="bg-[#2A0000]">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Dietary preference</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      value={profile.dietary}
                      onChange={(e) => updateProfile("dietary", e.target.value)}
                    >
                      {["Vegetarian", "Vegan", "Non-vegetarian", "Jain"].map((option) => (
                        <option key={option} value={option} className="bg-[#2A0000]">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-300">Profile updates save automatically for this session.</p>
                  <button className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors flex items-center gap-2">
                    <UserCog size={16} /> Save profile
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      {slotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#150000] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#C6A14A]">Calendar</p>
                <h3 className="text-xl font-semibold text-white">Add slot</h3>
              </div>
              <button
                onClick={() => setSlotModalOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Slot name</label>
                <input
                  value={slotForm.name}
                  onChange={(e) => setSlotForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C6A14A]"
                  placeholder="e.g. Decor walkthrough"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Date & time</label>
                <input
                  type="datetime-local"
                  value={slotForm.date}
                  onChange={(e) => setSlotForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-[#C6A14A]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSlotModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={saveCalendarSlot}
                className="px-4 py-2 rounded-lg bg-[#C6A14A] text-black font-semibold hover:bg-[#E8C56B] transition-colors"
                disabled={!slotForm.name.trim() || !slotForm.date.trim()}
              >
                Save slot
              </button>
            </div>
          </div>
        </div>
      )}
    </SwipeTransition>
  );
}
