"use client";

// Gallery upload state and logic for booking/contact panel
// ...existing code...
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MapPin, Camera, Users, Check, Phone, Mail, Share2, Sparkles, Calendar, Shield } from "lucide-react";
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

const fallbackVendor = {
  id: "demo-vendor",
  companyName: "Golden Events Co.",
  services: "Catering, Decor, Lighting",
  description: "Full-service event vendor for weddings and corporate functions.",
  rating: "4.9",
  reviews: 156,
  phone: "+92 300 1234567",
  website: "https://golden-events.example.com",
  user: { email: "vendor@example.com" },
  venues: [
    {
      id: "demo-venue",
      name: "Aurora Banquets",
      location: "Lahore, Pakistan",
      capacity: 300,
      priceRange: "200k - 500k",
      description: "Modern banquet hall with ambient lighting and indoor/outdoor options.",
      amenities: ["Parking", "Bridal Suite", "AV", "Catering", "Generator Backup"],
      images: [
        "https://images.unsplash.com/photo-1529634899554-1c1a26ad6b48",
        "https://images.unsplash.com/photo-1521540216272-a50305cd4421",
      ],
    },
  ],
};

function VendorStorefrontContent() {
  // Booking/contact panel state and logic (must be inside component)
  const [selectedDate, setSelectedDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Simulate booking submission (replace with real API as needed)
  const submitBooking = async (intent: "visit" | "quote" | "reserve") => {
    setBookingLoading(true);
    setBookingMessage(null);
    try {
      // TODO: Replace with real API call for vendor booking
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setBookingMessage("Request sent. We will reach out soon.");
    } catch (err) {
      setBookingMessage("Failed to submit booking");
    } finally {
      setBookingLoading(false);
    }
  };
  const searchParams = useSearchParams();
  const router = useRouter();
  const vendorIdFromUrl = searchParams.get("vendorId") || searchParams.get("id") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<any | null>(null);
  const [me, setMe] = useState<{ id: string; vendorProfileId: string | null } | null>(null);
  const [vendorId, setVendorId] = useState<string>(vendorIdFromUrl);

  const heroClass = useMemo(() => gradientPalette[0], []);

  // Helper to render packages
  const renderPackages = () => {
    const packages: any[] = Array.isArray(vendor?.packages) ? vendor.packages : [];
    if (!packages.length) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.13 }}
        className="bg-gradient-to-br from-[#6A0000] to-[#3A0000] rounded-xl p-6 border border-[#C6A14A]/20 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Packages</h3>
          <span className="text-sm text-[#C6A14A]">{packages.length} available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {packages.map((pkg: any, idx: number) => (
            <div key={pkg.name + idx} className="rounded-lg bg-white/5 border border-white/10 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold text-white">{pkg.name || `Package ${idx + 1}`}</span>
                {pkg.price && <span className="ml-auto px-2 py-1 rounded bg-[#C6A14A]/20 text-[#C6A14A] text-xs font-bold">{formatCurrency(pkg.price)}</span>}
              </div>
              {pkg.description && <p className="text-gray-300 text-sm mb-1">{pkg.description}</p>}
              {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                <ul className="list-disc list-inside text-gray-400 text-xs mb-1">
                  {(pkg.features as string[]).map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

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
          if (res.status === 401) {
            setError("Sign in to view your private storefront.");
            setVendor(fallbackVendor);
          } else {
            setError(detail?.error || "Unable to load vendor profile");
          }
          return;
        }
        const data = await res.json();
        const picked = Array.isArray(data) ? data.find((v) => v.id === vendorId) || data[0] : data;
        setVendor(picked || fallbackVendor);
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

  const partnerVenues = vendor?.venues || [];
  const primaryVenue = partnerVenues[0];
  const vendorLocation = (vendor as any)?.location || primaryVenue?.location;
  const vendorMapEmbed = (vendor as any)?.mapEmbedUrl || primaryVenue?.mapEmbedUrl;
  const heroImage = primaryVenue?.images?.[0];
  const gallery = partnerVenues.flatMap((v: any, idx: number) => (
    v?.images?.length ? v.images : [gradientPalette[(idx + 1) % gradientPalette.length]]
  ))?.slice(0, 8) || [];
  const highlights = vendor?.services ? vendor.services.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
  const eventTypes = Array.isArray(vendor?.eventTypes)
    ? vendor.eventTypes
    : (vendor?.eventTypes as any)?.split?.(",")?.map((s: string) => s.trim()).filter(Boolean) || [];

  // ...existing code...

  // Place the packages section just before the return
  const packagesSection = renderPackages();

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
                    <span className="flex items-center gap-2"><MapPin size={16} /> {(vendorLocation || "Vendor location on request")}</span>
                    <span className="flex items-center gap-1 text-[#C6A14A]"><Star size={16} fill="#C6A14A" /> {vendor?.rating ?? "—"}</span>
                    <span className="text-gray-300">({vendor?.reviews ?? 0} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Packages section */}
            {packagesSection}

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
                  {(highlights.length ? highlights : ["Reliable vendor", "Transparent pricing", "Fast response"]).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-gray-200">
                      <Check size={16} className="text-[#C6A14A]" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                {vendor?.description && (
                  <p className="text-gray-200 text-sm leading-relaxed">{vendor.description}</p>
                )}
              </div>
              {/* Booking/Contact Panel */}
              <div className="rounded-xl p-6 bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] border border-[#C6A14A]/20 space-y-3">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {vendor?.priceRange || vendor?.startingPrice || "Custom pricing"}
                  </div>
                  <p className="text-gray-400 text-sm">Starting price</p>
                </div>
                <div className="space-y-4 mb-4">
                  {/* Date Picker */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Event Date</label>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                      <Calendar size={18} className="text-[#C6A14A]" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-white outline-none flex-1"
                      />
                    </div>
                  </div>
                  {/* Guest Count */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Number of Guests</label>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                      <Users size={18} className="text-[#C6A14A]" />
                      <input
                        type="number"
                        placeholder="500-1000"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {bookingMessage && (
                    <div className="text-sm px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white">{bookingMessage}</div>
                  )}
                  <button
                    onClick={() => submitBooking("visit")}
                    disabled={bookingLoading}
                    className="w-full py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-60"
                  >
                    {bookingLoading ? "Sending…" : "Book Site Visit"}
                  </button>
                  <button
                    onClick={() => submitBooking("quote")}
                    disabled={bookingLoading}
                    className="w-full py-3 border-2 border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors disabled:opacity-60"
                  >
                    {bookingLoading ? "Sending…" : "Request Quote"}
                  </button>
                  <button
                    onClick={() => submitBooking("reserve")}
                    disabled={bookingLoading}
                    className="w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-60"
                  >
                    {bookingLoading ? "Sending…" : "Reserve Now"}
                  </button>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                    <Shield size={16} className="text-[#C6A14A]" />
                    <span>Secure payment with escrow</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check size={16} className="text-[#C6A14A]" />
                    <span>Free cancellation up to 30 days</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Offerings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Services & offerings</h3>
                  <span className="text-sm text-gray-300">Tailored to your event requirements</span>
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
                {(highlights.length ? highlights : ["Reliable vendor", "Transparent pricing", "Fast response"]).map((item: string, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <p className="text-white font-semibold">{item}</p>
                    <p className="text-gray-300 text-sm">We align to your brief and timeline.</p>
                    <button className="w-full mt-2 px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg font-semibold hover:bg-[#C6A14A]/25 transition-colors">
                      Request quote
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Event types */}
            {eventTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.11 }}
                className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Event types we serve</h3>
                  <span className="text-sm text-[#C6A14A]">{eventTypes.length} listed</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((t: string) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-sm">{t}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Partner venues */}
            {partnerVenues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="bg-gradient-to-br from-[#1F0A0A] to-[#2C0A0A] rounded-xl p-6 border border-[#C6A14A]/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Partner venues</h3>
                    <p className="text-gray-300 text-sm">Venues this vendor collaborates with.</p>
                  </div>
                  <span className="text-sm text-[#C6A14A]">{partnerVenues.length} listed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {partnerVenues.map((vn: any) => (
                    <div key={vn.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                      <p className="text-white font-semibold">{vn.name}</p>
                      <p className="text-gray-300 text-sm flex items-center gap-2"><MapPin size={14} /> {vn.location || "Location on request"}</p>
                      <p className="text-gray-400 text-xs">Capacity: {vn.capacity || "Flexible"}</p>
                      <div className="flex gap-2 text-sm">
                        {vn.id ? (
                          <Link href={`/venues/${vn.id}`} className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30 hover:bg-[#C6A14A]/25 transition-colors">
                            View venue
                          </Link>
                        ) : (
                          <span className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300">Contact for details</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Vendor location map */}
            {(vendorMapEmbed || vendorLocation) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#3A0000] rounded-xl p-6 border border-[#C6A14A]/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Location map</h3>
                    <p className="text-gray-300 text-sm">Vendor office or partner venue location.</p>
                  </div>
                  {vendorLocation && <span className="text-sm text-[#C6A14A] flex items-center gap-2"><MapPin size={16} /> {vendorLocation}</span>}
                </div>
                <div className="h-72 w-full overflow-hidden rounded-lg border border-white/10">
                  <iframe
                    title="Vendor map"
                    src={vendorMapEmbed || `https://www.google.com/maps?q=${encodeURIComponent(vendorLocation || "")}&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </motion.div>
            )}

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
                {(gallery.length ? gallery : gradientPalette.slice(0, 4)).map((bg: string, idx: number) => (
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

          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}

export default function VendorStorefront() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000]" />}>
      <VendorStorefrontContent />
    </Suspense>
  );
}
