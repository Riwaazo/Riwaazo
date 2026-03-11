"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
  Award,
  Clock,
  Users,
  Camera,
  Sparkles,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function VendorDetail() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "",
    message: "",
  });

  // Mock vendor data
  const vendor = {
    id: "1",
    name: "Lens & Light Photography",
    category: "Photography",
    rating: 4.9,
    reviews: 203,
    verified: true,
    location: "Mumbai, Maharashtra",
    experience: "8+ Years",
    eventsCompleted: 450,
    description:
      "Premium wedding and event photography services capturing your precious moments with artistic excellence. We specialize in candid photography, traditional portraits, and cinematic videography.",
    images: [
      "bg-gradient-to-br from-[#9B0000] to-[#6A0000]",
      "bg-gradient-to-br from-[#8B0000] to-[#5A0000]",
      "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
      "bg-gradient-to-br from-[#8B1010] to-[#5A0010]",
    ],
  };

  const packages = [
    {
      id: "basic",
      name: "Basic Package",
      price: "₹50,000",
      features: [
        "1 Professional Photographer",
        "6 Hours Coverage",
        "300+ Edited Photos",
        "Online Gallery",
        "Basic Photo Album",
      ],
    },
    {
      id: "premium",
      name: "Premium Package",
      price: "₹1,20,000",
      features: [
        "2 Professional Photographers",
        "12 Hours Coverage",
        "600+ Edited Photos",
        "1 Cinematographer",
        "Premium Photo Album",
        "Highlight Video (5-7 mins)",
        "Online Gallery",
        "Drone Coverage",
      ],
      popular: true,
    },
    {
      id: "luxury",
      name: "Luxury Package",
      price: "₹2,00,000",
      features: [
        "3 Professional Photographers",
        "Full Day Coverage",
        "1000+ Edited Photos",
        "2 Cinematographers",
        "Luxury Photo Album",
        "Full Wedding Film (20-30 mins)",
        "Highlight Video",
        "Pre-wedding Shoot",
        "Drone Coverage",
        "Same Day Edit",
      ],
    },
  ];

  const services = [
    "Wedding Photography",
    "Pre-wedding Shoots",
    "Candid Photography",
    "Traditional Photography",
    "Videography",
    "Drone Coverage",
    "Photo Albums",
    "Same Day Edit",
  ];

  const reviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Absolutely stunning work! They captured every emotion perfectly. The team was professional and made everyone comfortable.",
      event: "Wedding",
    },
    {
      name: "Rahul Verma",
      rating: 5,
      date: "1 month ago",
      comment:
        "Best decision we made for our wedding. The photos are breathtaking and the video brought tears to our eyes.",
      event: "Wedding",
    },
    {
      name: "Anjali Patel",
      rating: 4,
      date: "2 months ago",
      comment:
        "Great photography and very cooperative team. Would definitely recommend!",
      event: "Engagement",
    },
  ];

  const highlights = [
    { icon: Award, label: "Verified Professional", value: "Premium" },
    { icon: Clock, label: "Response Time", value: "Within 2 hours" },
    { icon: Users, label: "Events Completed", value: "450+" },
    { icon: Camera, label: "Equipment", value: "Professional Grade" },
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % vendor.images.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + vendor.images.length) % vendor.images.length
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Inquiry sent! The vendor will contact you soon.");
  };

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link
                  href="/vendors"
                  className="hover:text-[#C6A14A] transition-colors"
                >
                  Vendors
                </Link>
                <span>/</span>
                <Link
                  href="/vendors?category=photography"
                  className="hover:text-[#C6A14A] transition-colors"
                >
                  {vendor.category}
                </Link>
                <span>/</span>
                <span className="text-white">{vendor.name}</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative"
                >
                  <div
                    className={`h-[500px] rounded-xl ${vendor.images[currentImage]} relative overflow-hidden`}
                  >
                    {/* Navigation Arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                      {currentImage + 1} / {vendor.images.length}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="bg-white/90 hover:bg-white p-3 rounded-full transition-all"
                      >
                        <Heart
                          size={20}
                          className={
                            isFavorite
                              ? "text-red-500 fill-red-500"
                              : "text-gray-700"
                          }
                        />
                      </button>
                      <button className="bg-white/90 hover:bg-white p-3 rounded-full transition-all">
                        <Share2 size={20} className="text-gray-700" />
                      </button>
                    </div>

                    {vendor.verified && (
                      <div className="absolute top-4 left-4 bg-[#C6A14A] text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <Sparkles size={16} />
                        Verified Professional
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {vendor.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg ${img} ${
                          currentImage === idx
                            ? "ring-2 ring-[#C6A14A]"
                            : "opacity-50 hover:opacity-100"
                        } transition-all`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-serif text-white mb-2">
                        {vendor.name}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-300">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{vendor.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award size={16} />
                          <span>{vendor.experience} Experience</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star
                          size={20}
                          className="text-[#C6A14A] fill-[#C6A14A]"
                        />
                        <span className="text-2xl font-bold text-white">
                          {vendor.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {vendor.reviews} reviews
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {vendor.description}
                  </p>
                </motion.div>

                {/* Highlights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-4 border border-[#C6A14A]/20 text-center"
                    >
                      <item.icon className="w-8 h-8 text-[#C6A14A] mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </motion.div>

                {/* Services */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Services Offered
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <Check size={16} className="text-[#C6A14A]" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Packages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <h2 className="text-2xl font-serif text-white mb-6">
                    Pricing Packages
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`relative rounded-xl p-6 border-2 transition-all cursor-pointer ${
                          selectedPackage === pkg.id
                            ? "border-[#C6A14A] bg-[#C6A14A]/10"
                            : "border-white/20 hover:border-[#C6A14A]/50"
                        }`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C6A14A] text-black px-3 py-1 rounded-full text-xs font-semibold">
                            Most Popular
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {pkg.name}
                        </h3>
                        <p className="text-3xl font-bold text-[#C6A14A] mb-4">
                          {pkg.price}
                        </p>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-300"
                            >
                              <Check
                                size={16}
                                className="text-[#C6A14A] flex-shrink-0 mt-0.5"
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Reviews */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <h2 className="text-2xl font-serif text-white mb-6">
                    Client Reviews
                  </h2>
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">
                              {review.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {review.event} • {review.date}
                            </p>
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
                        <p className="text-gray-300 text-sm">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/20">
                    View All {vendor.reviews} Reviews
                  </button>
                </motion.div>
              </div>

              {/* Sidebar - Contact Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="sticky top-24"
                >
                  <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20">
                    <h3 className="text-xl font-serif text-white mb-4">
                      Request a Quote
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Your Name*
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-[#C6A14A] transition-colors"
                          placeholder="Enter your name"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Email Address*
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-[#C6A14A] transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Phone Number*
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-[#C6A14A] transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Event Date*
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.eventDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              eventDate: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-[#C6A14A] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Event Type*
                        </label>
                        <select
                          required
                          value={formData.eventType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              eventType: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-[#C6A14A] transition-colors"
                        >
                          <option value="" className="bg-black">
                            Select event type
                          </option>
                          <option value="wedding" className="bg-black">
                            Wedding
                          </option>
                          <option value="engagement" className="bg-black">
                            Engagement
                          </option>
                          <option value="pre-wedding" className="bg-black">
                            Pre-wedding
                          </option>
                          <option value="reception" className="bg-black">
                            Reception
                          </option>
                          <option value="other" className="bg-black">
                            Other
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-1 block">
                          Message
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border border-white/20 focus:border-[#C6A14A] transition-colors resize-none"
                          placeholder="Tell us about your event..."
                        />
                      </div>

                      {selectedPackage && (
                        <div className="bg-[#C6A14A]/20 border border-[#C6A14A] rounded-lg p-3">
                          <p className="text-xs text-gray-300 mb-1">
                            Selected Package
                          </p>
                          <p className="text-white font-semibold">
                            {
                              packages.find((p) => p.id === selectedPackage)
                                ?.name
                            }
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-4 bg-[#C6A14A] hover:bg-[#E8C56B] text-black font-semibold rounded-lg transition-colors"
                      >
                        Send Inquiry
                      </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/20 space-y-3">
                      <a
                        href="tel:+919876543210"
                        className="flex items-center gap-3 text-gray-300 hover:text-[#C6A14A] transition-colors"
                      >
                        <Phone size={18} />
                        <span>+91 98765 43210</span>
                      </a>
                      <a
                        href="mailto:info@lensandlight.com"
                        className="flex items-center gap-3 text-gray-300 hover:text-[#C6A14A] transition-colors"
                      >
                        <Mail size={18} />
                        <span>info@lensandlight.com</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
