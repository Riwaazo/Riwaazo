"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Users,
  Calendar,
  Check,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Utensils,
  Music,
  Camera,
  Shield,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const gradientPalette = [
  "bg-gradient-to-br from-[#8B0000] to-[#5A0000]",
  "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
  "bg-gradient-to-br from-[#9B0000] to-[#6A0000]",
  "bg-gradient-to-br from-[#8B1010] to-[#5A0010]",
];

const formatPrice = (value?: string | number | null) => {
  if (value === null || value === undefined) return "On request";
  if (typeof value === "number") return `₹${(value / 100000).toFixed(1)}L`;
  if (typeof value === "string" && value.trim().length > 0) return value.startsWith("₹") ? value : `₹${value}`;
  return "On request";
};

export default function VenueDetailPage() {
  const params = useParams<{ venueId: string }>();
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueData, setVenueData] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!params?.venueId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/venues/${params.venueId}`, { cache: "no-store" });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(detail?.error || "Unable to load venue");
        }
        const data = await res.json();
        if (!active) return;
        const paletteImage = gradientPalette[0];
        const images = (data.images || []).length ? data.images : [paletteImage];
        setVenueData({
          ...data,
          images,
          gallery: images,
          capacityRange: data.capacity ? { min: data.capacity, max: data.capacity } : null,
          rating: data.rating || 4.8,
          reviewCount: data.reviewCount || 0,
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load venue");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [params?.venueId]);

  const nextImage = () => {
    if (!venueData?.images?.length) return;
    setCurrentImage((prev) => (prev + 1) % venueData.images.length);
  };

  const prevImage = () => {
    if (!venueData?.images?.length) return;
    setCurrentImage((prev) => (prev - 1 + venueData.images.length) % venueData.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000] flex items-center justify-center text-gray-200">
        Loading venue…
      </div>
    );
  }

  if (error || !venueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000] flex items-center justify-center text-gray-200 p-6">
        <div className="max-w-md w-full space-y-3">
          <p className="text-lg font-semibold text-white">Unable to load venue</p>
          <p className="text-sm text-gray-300">{error || "Venue not found"}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold">Go back</button>
        </div>
      </div>
    );
  }

  const mapUrl = venueData.mapEmbedUrl || (venueData.location ? `https://www.google.com/maps?q=${encodeURIComponent(venueData.location)}&output=embed` : null);
  const amenities = (venueData.amenities || []).map((name: string) => ({ icon: Check, name }));
  const highlights = amenities.slice(0, 6).map((a) => a.name);
  const capacityValue = venueData.capacity || venueData.capacityRange?.max;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-[#C6A14A] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/venues"
                className="hover:text-[#C6A14A] transition-colors"
              >
                Venues
              </Link>
              <span>/</span>
              <span className="text-[#C6A14A]">{venueData.name}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative h-96 rounded-2xl overflow-hidden group">
                  <div
                    className={`absolute inset-0 ${venueData.images[currentImage]?.startsWith("http") ? "bg-cover bg-center" : venueData.images[currentImage] || gradientPalette[0]}`}
                    style={venueData.images[currentImage]?.startsWith("http") ? { backgroundImage: `url(${venueData.images[currentImage]})` } : undefined}
                  />
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Navigation Buttons */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImage + 1} / {venueData.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {venueData.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === idx
                          ? "border-[#C6A14A]"
                          : "border-transparent"
                      }`}
                    >
                      <div
                        className={`w-full h-full ${img.startsWith("http") ? "bg-cover bg-center" : img}`}
                        style={img.startsWith("http") ? { backgroundImage: `url(${img})` } : undefined}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Venue Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border border-[#C6A14A]/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-serif text-white mb-2">
                      {venueData.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin size={18} className="text-[#C6A14A]" />
                        {venueData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star
                          size={18}
                          className="text-[#C6A14A] fill-[#C6A14A]"
                        />
                        <span className="font-semibold text-white">
                          {venueData.rating}
                        </span>
                        <span className="text-gray-400">
                          ({venueData.reviews.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-2 rounded-full border transition-all ${
                        isFavorite
                          ? "bg-[#C6A14A] border-[#C6A14A] text-black"
                          : "border-[#C6A14A] text-[#C6A14A] hover:bg-[#C6A14A]/10"
                      }`}
                    >
                      <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2 rounded-full border border-[#C6A14A] text-[#C6A14A] hover:bg-[#C6A14A]/10 transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">{venueData.description || "No description provided yet."}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-[#C6A14A] mb-2">
                      <Users size={20} />
                      <span className="text-sm font-semibold">Capacity</span>
                    </div>
                    <p className="text-white text-xl font-bold">{capacityValue || "—"}</p>
                    <p className="text-gray-400 text-sm">guests</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-[#C6A14A] mb-2">
                      <Calendar size={20} />
                      <span className="text-sm font-semibold">Starting price</span>
                    </div>
                    <p className="text-white text-xl font-bold">{formatPrice(venueData.priceRange)}</p>
                    <p className="text-gray-400 text-sm">per event</p>
                  </div>
                </div>
              </motion.div>

              {/* Booking flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border border-[#C6A14A]/20 space-y-4"
              >
                <h3 className="text-2xl font-serif text-white">Plan your visit or book</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Preferred date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Guest count</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 300"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Event type</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none">
                      {["Wedding", "Engagement", "Corporate", "Social"].map((type) => (
                        <option key={type} value={type} className="bg-[#2A0000]">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button className="px-5 py-3 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors">
                    Request visit slot
                  </button>
                  <button className="px-5 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-colors">
                    Book this venue
                  </button>
                  <p className="text-sm text-gray-300">Creates an event draft in your dashboard.</p>
                </div>
              </motion.div>

              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border border-[#C6A14A]/20"
              >
                <h2 className="text-2xl font-serif text-white mb-6">
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {venueData.amenities.map((amenity, idx) => {
                    const Icon = amenity.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <Icon size={20} className="text-[#C6A14A]" />
                        <span className="text-white text-sm">
                          {amenity.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border border-[#C6A14A]/20"
              >
                <h2 className="text-2xl font-serif text-white mb-6">
                  Venue Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {venueData.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check size={18} className="text-[#C6A14A]" />
                      <span className="text-gray-300">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Vendor Policy
                  </h3>
                  <p className="text-gray-300">{venueData.vendorRestrictions}</p>
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border border-[#C6A14A]/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif text-white">
                    Guest Reviews
                  </h2>
                  <div className="flex items-center gap-2 bg-[#C6A14A] text-black px-4 py-2 rounded-lg font-semibold">
                    <Star size={18} fill="currentColor" />
                    {venueData.rating}
                  </div>
                </div>

                <div className="space-y-4">
                  {venueData.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">
                            {review.name}
                          </h4>
                          <p className="text-gray-400 text-sm">{review.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="text-[#C6A14A] fill-[#C6A14A]"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors">
                  View All Reviews
                </button>
              </motion.div>

              {/* Map Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border border-[#C6A14A]/20"
              >
                <h2 className="text-2xl font-serif text-white mb-6">Location</h2>
                <div className="bg-white/5 rounded-lg h-64 flex items-center justify-center border border-white/10">
                  <p className="text-gray-400">Map integration placeholder</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-300">
                  <MapPin size={18} className="text-[#C6A14A]" />
                  <span>{venueData.location}</span>
                </div>
              </motion.div>
            </div>

            {/* Sticky Booking Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="sticky top-24 bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-2xl p-6 border-2 border-[#C6A14A]/30 shadow-2xl"
              >
                <div className="mb-6">
                  <div className="text-3xl font-bold text-white mb-1">
                    ₹{(venueData.price / 100000).toFixed(1)}L
                  </div>
                  <p className="text-gray-400 text-sm">Starting price</p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Date Picker */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Event Date
                    </label>
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
                    <label className="text-sm text-gray-300 mb-2 block">
                      Number of Guests
                    </label>
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
                  <button className="w-full py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors">
                    Book Site Visit
                  </button>
                  <button className="w-full py-3 border-2 border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors">
                    Request Quote
                  </button>
                  <button className="w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                    Reserve Now
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
