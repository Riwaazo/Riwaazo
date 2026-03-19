"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/client";

const palette = {
  gold: "#C6A14A",
  goldLight: "#F4D58D",
  red: "#8B1E3F",
};

export default function PlannerPortfolioPage() {
  const supabase = useMemo(() => createClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [plannerName, setPlannerName] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const role = (data.user?.user_metadata?.role as string | undefined)?.toUpperCase();
      const isPlanner = role === "PLANNER" || role === "EVENT_PLANNER";
      if (!data.user || !isPlanner) {
        setAuthError("Only event planners can view this portfolio");
        return;
      }
      const name = (data.user.user_metadata?.full_name as string | undefined) || data.user.email || "Planner";
      setPlannerName(name);
      setAuthChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 py-12 flex items-center justify-center">
        {authError || "Loading portfolio…"}
      </main>
    );
  }

  const sampleProjects = [
    {
      title: "Royal Sangeet Gala",
      location: "Jaipur",
      summary: "300 guests, heritage palace, 12-vendor coordination",
    },
    {
      title: "Modern Corporate Summit",
      location: "Mumbai",
      summary: "2-day offsite, AV + staging, speaker concierge",
    },
    {
      title: "Intimate Beach Wedding",
      location: "Goa",
      summary: "80 guests, sundowner ceremony, decor + F&B",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 pb-12 pt-28 relative overflow-hidden">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${palette.red}26` }} />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${palette.gold}1f` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#111827_1px,transparent_0)] [background-size:24px_24px] opacity-15" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Link href="/event-planner/dashboard" className="flex items-center gap-1 text-gray-300 hover:text-[#C6A14A]">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: palette.goldLight }}>
              <Sparkles size={14} /> Portfolio
            </div>
            <p className="text-2xl font-semibold text-white mt-1">{plannerName}&apos;s showcase</p>
            <p className="text-sm text-gray-400">Signature work, specialties, and regions you cover.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/event-planner/portfolio/edit"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: `1px solid ${palette.gold}`, backgroundColor: `${palette.gold}26`, color: palette.goldLight }}
            >
              Edit portfolio
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {sampleProjects.map((proj) => (
            <div key={proj.title} className="rounded-xl border border-white/10 bg-white/5 shadow-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-[#0B0B14] via-black to-[#1f1b24]" />
              <div className="p-3 space-y-2">
                <p className="text-white font-semibold">{proj.title}</p>
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <MapPin size={14} /> {proj.location}
                </p>
                <p className="text-xs text-gray-400">{proj.summary}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 size={14} style={{ color: palette.goldLight }} /> Curate details
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg space-y-3">
          <h3 className="text-lg font-semibold text-white">Services & regions</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {["Full planning", "Day-of coordination", "Vendor sourcing", "Design & decor", "Logistics"].map((chip) => (
              <span key={chip} className="rounded-full px-3 py-1 border border-white/10 bg-white/5 text-gray-200">
                {chip}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-gray-300">
            {["Jaipur", "Goa", "Mumbai", "Delhi NCR"].map((loc) => (
              <span key={loc} className="rounded-full px-3 py-1 border border-white/10 bg-white/5">{loc}</span>
            ))}
          </div>
          <p className="text-sm text-gray-400">Edit to sync with your real portfolio content.</p>
        </section>
      </div>
    </main>
  );
}
