"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, Camera, Users, Check, Phone, Mail, Share2, Sparkles } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const gradientPalette = [
  "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
  "bg-gradient-to-br from-[#9B0000] to-[#6A0000]",
  "bg-gradient-to-br from-[#6A0000] to-[#3A0000]",
  "bg-gradient-to-br from-[#8B1010] to-[#5A0010]",
  "bg-gradient-to-br from-[#5A0000] to-[#2C0000]",
];

const formatCurrency = (value?: string | null) => {
  if (!value) return "Custom pricing";
  return value.startsWith("₹") ? value : `₹${value}`;
};

export default function VendorStorefront() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorIdFromUrl = searchParams.get("vendorId") || searchParams.get("id") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<any | null>(null);
  const [me, setMe] = useState<{ id: string; vendorProfileId: string | null } | null>(null);
  const [vendorId, setVendorId] = useState<string>(vendorIdFromUrl);

  const heroClass = useMemo(() => gradientPalette[0], []);

  // Resolve vendorId: prefer URL, else current vendor session
  useEffect(() => {
    let active = true;
    const resolveId = async () => {
      if (vendorIdFromUrl) {
        setVendorId(vendorIdFromUrl);
        return;
      }
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        if (!meRes.ok) return;
        const { user } = await meRes.json();
        if (!active) return;
        if (user?.vendorProfileId) {
          setMe({ id: user.id, vendorProfileId: user.vendorProfileId });
          setVendorId(user.vendorProfileId);
          // Keep URL stable for sharing
          router.replace(`/vendors/storefront?vendorId=${encodeURIComponent(user.vendorProfileId)}`);
        }
      } catch (_) {
        /* ignore */
      }
    };
    resolveId();
    return () => {
      active = false;
    };
  }, [vendorIdFromUrl, router]);

  useEffect(() => {
    let active = true;
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/vendors?id=${encodeURIComponent(vendorId)}`, { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          setError(detail?.error || "Unable to load vendor profile");
          return;
        }
        const data = await res.json();
        setVendor(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load vendor profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [vendorId]);

  const primaryVenue = vendor?.venues?.[0];
  const heroImage = primaryVenue?.images?.[0];
  const gallery = vendor?.venues?.flatMap((v: any, idx: number) => (
    v.images?.length ? v.images : [gradientPalette[(idx + 1) % gradientPalette.length]]
  ))?.slice(0, 8) || [];
  const highlights = vendor?.services ? vendor.services.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
  const mapUrl = primaryVenue?.mapEmbedUrl || (primaryVenue?.location ? `https://www.google.com/maps?q=${encodeURIComponent(primaryVenue.location)}&output=embed` : null);

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {!loading && error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {loading && (
              <div className="rounded-lg border border-white/10 bg-white/5 text-gray-200 px-4 py-3 text-sm">
                Loading storefront…
              </div>
            )}
            {!loading && !vendor && !error && (
              <div className="rounded-lg border border-white/10 bg-white/5 text-gray-200 px-4 py-3 text-sm">
                No vendor profile found.
              </div>
            )}

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden border border-[#C6A14A]/20 bg-gradient-to-br from-[#5A0000] to-[#2C0000]"
            >
              <div
                className={`relative h-64 ${heroImage ? "bg-cover bg-center" : heroClass}`}
                style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#C6A14A] text-black text-xs font-semibold flex items-center gap-2">
                      <Sparkles size={14} /> Verified vendor
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">{vendor?.companyName || "Vendor"}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm">
                    <span className="flex items-center gap-2"><Camera size={16} /> {vendor?.services || "Services"}</span>
                    <span className="flex items-center gap-2"><MapPin size={16} /> {primaryVenue?.location || "Location"}</span>
                    <span className="flex items-center gap-1 text-[#C6A14A]"><Star size={16} fill="#C6A14A" /> {vendor?.rating ?? "—"}</span>
                    <span className="text-gray-300">({vendor?.reviews ?? 0} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Highlights & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="md:col-span-2 rounded-xl p-6 bg-gradient-to-br from-[#6A0000] to-[#3A0000] border border-[#C6A14A]/20 space-y-3">
                <h2 className="text-white font-semibold text-lg">Why clients choose us</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(highlights.length ? highlights : ["Reliable vendor", "Transparent pricing", "Fast response"]).map((item) => (
                    <div key={item} className="flex items-start gap-2 text-gray-200">
                      <Check size={16} className="text-[#C6A14A]" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                {vendor?.description && (
                  <p className="text-gray-200 text-sm leading-relaxed">{vendor.description}</p>
                )}
              </div>
              <div className="rounded-xl p-6 bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-3">
                <h3 className="text-white font-semibold">Get in touch</h3>
                <p className="text-gray-300 text-sm">Share your date and requirements; we respond within 2 hours.</p>
                <div className="flex flex-col gap-2 text-sm">
                  {vendor?.phone && (
                    <Link href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-[#C6A14A] hover:text-[#E8C56B]">
                      <Phone size={14} /> {vendor.phone}
                    </Link>
                  )}
                  <Link href={`mailto:${vendor?.user?.email || "hello@example.com"}`} className="flex items-center gap-2 text-[#C6A14A] hover:text-[#E8C56B]">
                    <Mail size={14} /> {vendor?.user?.email || "hello@example.com"}
                  </Link>
                  {vendor?.website && (
                    <Link href={vendor.website} target="_blank" className="flex items-center gap-2 text-[#C6A14A] hover:text-[#E8C56B]">
                      <Sparkles size={14} /> {vendor.website}
                    </Link>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/auth/signup?role=vendor"
                    className="flex-1 text-center px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors"
                  >
                    Book a call
                  </Link>
                  <button className="px-3 py-2 border border-[#C6A14A]/60 text-[#C6A14A] rounded-lg hover:bg-[#C6A14A]/10 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Venue details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">Venue details</h3>
                  <p className="text-gray-300 text-sm">Location, pricing, and amenities tailored by the vendor.</p>
                </div>
                {primaryVenue?.priceRange && <span className="px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] text-sm">{formatCurrency(primaryVenue.priceRange)}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-200">
                <div className="flex items-center gap-2"><MapPin size={16} /> {primaryVenue?.location || "Add location"}</div>
                <div className="flex items-center gap-2"><Users size={16} /> {primaryVenue?.capacity ? `${primaryVenue.capacity} guests` : "Flexible capacity"}</div>
              </div>
              {primaryVenue?.description && <p className="text-gray-300 text-sm leading-relaxed">{primaryVenue.description}</p>}
              {!!(primaryVenue?.amenities?.length) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {primaryVenue.amenities.map((a: string) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white">{a}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Packages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Packages</h3>
                  <span className="text-sm text-gray-300">Custom bundles available</span>
                </div>
                {me?.vendorProfileId === vendor?.id && (
                  <Link
                    href="/dashboard/vendors"
                    className="text-sm px-3 py-1 rounded-lg border border-[#C6A14A]/60 text-[#C6A14A] hover:bg-[#C6A14A]/10"
                  >
                    Edit storefront
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(vendor?.venues?.length ? vendor.venues : [{ name: "Standard package", priceRange: "On request", description: vendor?.description || "" }]).map((pkg: any, idx: number) => (
                  <div key={pkg.id || idx} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <p className="text-white font-semibold">{pkg.name || "Package"}</p>
                    <p className="text-2xl text-[#C6A14A] font-bold">{formatCurrency(pkg.priceRange)}</p>
                    <p className="text-gray-300 text-sm">{pkg.description || "Tailored to your event needs."}</p>
                    <button className="w-full mt-2 px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg font-semibold hover:bg-[#C6A14A]/25 transition-colors">
                      Request quote
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Gallery</h3>
                <span className="text-gray-300 text-sm">Featured highlights</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(gallery.length ? gallery : gradientPalette.slice(0, 4)).map((bg, idx) => (
                  <div
                    key={idx}
                    className={`h-28 rounded-lg relative overflow-hidden ${typeof bg === "string" && bg.startsWith("http") ? "bg-cover bg-center" : typeof bg === "string" ? bg : ""}`}
                    style={typeof bg === "string" && bg.startsWith("http") ? { backgroundImage: `url(${bg})` } : undefined}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-2 left-2 text-white text-xs">Shot #{idx + 1}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            {mapUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#3A0000] rounded-xl p-6 border border-[#C6A14A]/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Location map</h3>
                    <p className="text-gray-300 text-sm">Preview how guests will find the venue.</p>
                  </div>
                  {primaryVenue?.location && <span className="text-sm text-[#C6A14A] flex items-center gap-2"><MapPin size={16} /> {primaryVenue.location}</span>}
                </div>
                <div className="h-72 w-full overflow-hidden rounded-lg border border-white/10">
                  <iframe
                    title="Venue map"
                    src={mapUrl}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
