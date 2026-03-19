"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Phone,
  Globe,
  Briefcase,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/shared/Navbar";

interface PlannerProfile {
  id: string;
  companyName: string;
  phone: string | null;
  services: string | null;
  description: string | null;
  website: string | null;
}

export default function PlannerProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  // Auth check
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const role = (data.user?.user_metadata?.role as string)?.toUpperCase();
      const isPlanner = role === "EVENT_PLANNER" || role === "PLANNER";
      if (!data.user || !isPlanner) {
        router.replace("/dashboard");
        return;
      }
      setAuthChecked(true);
    })();
    return () => { active = false; };
  }, [router, supabase]);

  // Fetch existing profile
  useEffect(() => {
    if (!authChecked) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/event-planners/me", { cache: "no-store", credentials: "include" });
        if (res.ok) {
          const profile: PlannerProfile = await res.json();
          if (!active) return;
          setHasProfile(true);
          setCompanyName(profile.companyName || "");
          setPhone(profile.phone || "");
          setServices(profile.services || "");
          setDescription(profile.description || "");
          setWebsite(profile.website || "");
        }
      } catch {
        // No profile yet — that's fine
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [authChecked]);

  const handleSave = async () => {
    if (!companyName.trim()) {
      setError("Company / brand name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);

    const body = { companyName, phone, services, description, website };
    const method = hasProfile ? "PATCH" : "POST";

    try {
      const res = await fetch("/api/event-planners", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || "Failed to save profile");
      }
      setHasProfile(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#0B0B14] text-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Checking access…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B14] text-gray-100 pb-12 pt-28 px-4 sm:px-6">
      <Navbar />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/event-planner/dashboard"
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#C6A14A] mb-2"
            >
              <ArrowLeft size={16} /> Back to dashboard
            </Link>
            <h1 className="text-3xl font-serif text-white">
              {hasProfile ? "Edit Your Profile" : "Create Your Profile"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              This is how you appear on the{" "}
              <Link href="/event-planners" className="text-[#C6A14A] underline">
                Event Planners marketplace
              </Link>
              .
            </p>
          </div>
          {hasProfile && (
            <Link
              href="/event-planners"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C6A14A] text-[#C6A14A] hover:bg-[#C6A14A]/10 text-sm font-medium transition-colors"
            >
              <Eye size={16} /> View live listing
            </Link>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#C6A14A]" />
            <span className="ml-3 text-gray-400">Loading profile…</span>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6 shadow-lg">
            {/* Company name */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Building2 size={16} className="text-[#C6A14A]" /> Company / Brand Name *
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your planning company name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none transition-colors"
              />
            </div>

            {/* Services */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Briefcase size={16} className="text-[#C6A14A]" /> Services
              </label>
              <input
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Wedding planning, corporate events, destination weddings..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500">Comma-separated list of what you offer.</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <FileText size={16} className="text-[#C6A14A]" /> About / Bio
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell potential clients about your experience, style, and what sets you apart..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Phone & Website side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 flex items-center gap-2">
                  <Phone size={16} className="text-[#C6A14A]" /> Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300 flex items-center gap-2">
                  <Globe size={16} className="text-[#C6A14A]" /> Website
                </label>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Errors / Success */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300 flex items-center gap-2">
                <CheckCircle size={16} />
                Profile saved! You are now listed on the marketplace.
              </div>
            )}

            {/* Save */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                {hasProfile
                  ? "Changes appear immediately on the marketplace."
                  : "Saving will publish your profile to the marketplace."}
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving…" : hasProfile ? "Update Profile" : "Publish Profile"}
              </button>
            </div>
          </div>
        )}

        {/* Preview Card */}
        {companyName.trim() && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Live Preview</h2>
            <p className="text-xs text-gray-400">This is how your card looks on the marketplace.</p>
            <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl overflow-hidden border border-[#C6A14A]/20 max-w-sm">
              <div className="h-24 bg-gradient-to-br from-[#9B0000] to-[#6A0000] relative">
                <div className="absolute bottom-3 left-4 w-10 h-10 rounded-full bg-[#C6A14A] flex items-center justify-center text-black text-lg font-bold">
                  {companyName.charAt(0)}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-white font-semibold">{companyName}</h3>
                {description && <p className="text-gray-300 text-sm line-clamp-2">{description}</p>}
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <p className="text-[#C6A14A] font-semibold text-sm">{services || "Full-service planning"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
