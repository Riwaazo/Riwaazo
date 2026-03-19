"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, MapPin, Phone, Sparkles, Star } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type Vendor = {
  id: string;
  companyName: string;
  services?: string | null;
  phone?: string | null;
  location?: string | null;
  description?: string | null;
  packages?: Array<{ name?: string; price?: string; description?: string; features?: string[] }>;
  venues?: Array<{ images?: string[]; location?: string | null }>;
};

export default function VendorDetail() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params?.vendorId;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/vendors?id=${encodeURIComponent(vendorId)}`, { cache: "no-store" });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(detail?.error || "Failed to load vendor");
        }
        const data = await res.json();
        if (!active) return;
        setVendor(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load vendor");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [vendorId]);

  const heroImage = useMemo(() => {
    const images = vendor?.venues?.flatMap((v) => v.images || []) || [];
    return images[0] || null;
  }, [vendor]);

  const packages = useMemo(() => vendor?.packages || [], [vendor]);
  const services = useMemo(() => (vendor?.services || "").split(",").map((s) => s.trim()).filter(Boolean), [vendor]);

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-white">Loading vendor…</div>
            ) : error ? (
              <div className="text-red-200">{error}</div>
            ) : vendor ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative h-72 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      {heroImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${heroImage})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">No images yet</div>
                      )}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => setFavorite((f) => !f)}
                          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                        >
                          <Heart size={18} className={favorite ? "text-red-400" : ""} />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h1 className="text-2xl font-semibold text-white">{vendor.companyName}</h1>
                          <p className="text-gray-300 text-sm">{services.join(" · ") || "Services coming soon"}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-200">
                          <MapPin size={16} className="text-[#C6A14A]" />
                          <span>{vendor.location || vendor.venues?.[0]?.location || "Location TBD"}</span>
                        </div>
                      </div>
                      {vendor.description && <p className="text-gray-200 text-sm leading-relaxed">{vendor.description}</p>}
                    </div>

                    {services.length > 0 && (
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-semibold mb-3">Services</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-200">
                          {services.map((svc) => (
                            <span key={svc} className="px-3 py-1 rounded-full bg-black/40 border border-white/10">
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {packages.length > 0 && (
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg">Packages</h3>
                            <p className="text-gray-400 text-sm">Admin-approved packages</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Sparkles size={16} className="text-[#C6A14A]" /> Curated
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {packages.map((pkg, idx) => (
                            <div key={`${pkg.name || "pkg"}-${idx}`} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-semibold">{pkg.name || "Package"}</p>
                                  <p className="text-[#C6A14A] font-semibold text-sm">{pkg.price || "On request"}</p>
                                </div>
                                <span className="text-xs text-gray-300">{pkg.features?.length || 0} features</span>
                              </div>
                              {pkg.description && <p className="text-gray-300 text-sm">{pkg.description}</p>}
                              {pkg.features?.length ? (
                                <ul className="text-sm text-gray-200 space-y-1">
                                  {pkg.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2">
                                      <Star size={12} className="text-[#C6A14A]" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <h3 className="text-white font-semibold">Contact</h3>
                      <div className="flex items-center gap-2 text-gray-200 text-sm">
                        <Phone size={16} className="text-[#C6A14A]" />
                        <span>{vendor.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-200 text-sm">
                        <MapPin size={16} className="text-[#C6A14A]" />
                        <span>{vendor.location || vendor.venues?.[0]?.location || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Link href="/vendors" className="text-sm text-[#C6A14A] hover:text-[#E8C56B]">← Back to vendors</Link>
                </div>
              </div>
            ) : (
              <div className="text-gray-200">Vendor not found.</div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
