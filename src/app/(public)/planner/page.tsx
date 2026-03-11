"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  ShoppingBag,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Home as HomeIcon,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function EventPlanner() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    eventType: "",
    guestCount: "",
    budget: "",
    city: "",
    eventDate: "",
    preferences: {
      venueType: "",
      cateringStyle: "",
      photographyStyle: "",
    },
  });

  const eventTypes = [
    { id: "wedding", name: "Wedding", desc: "Full ceremony and reception" },
    {
      id: "engagement",
      name: "Engagement",
      desc: "Pre-wedding celebration",
    },
    { id: "reception", name: "Reception", desc: "Post-wedding party" },
    { id: "sangeet", name: "Sangeet", desc: "Musical night celebration" },
    { id: "mehendi", name: "Mehendi", desc: "Henna ceremony" },
    {
      id: "corporate",
      name: "Corporate Event",
      desc: "Business gatherings",
    },
  ];

  const guestRanges = [
    { id: "50-100", label: "50-100 guests", icon: "👥" },
    { id: "100-200", label: "100-200 guests", icon: "👥👥" },
    { id: "200-500", label: "200-500 guests", icon: "👥👥👥" },
    { id: "500+", label: "500+ guests", icon: "👥👥👥👥" },
  ];

  const budgetRanges = [
    { id: "0-5", label: "Under ₹5 Lakhs", desc: "Intimate & Budget-friendly" },
    { id: "5-10", label: "₹5-10 Lakhs", desc: "Moderate Budget" },
    { id: "10-25", label: "₹10-25 Lakhs", desc: "Premium Budget" },
    { id: "25+", label: "₹25+ Lakhs", desc: "Luxury Experience" },
  ];

  const cities = [
    "New Delhi",
    "Mumbai",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad",
  ];

  const venueTypes = [
    "Banquet Hall",
    "Outdoor Garden",
    "Resort",
    "Hotel",
    "Farmhouse",
    "Beach",
  ];

  const recommendedVenues = [
    {
      id: "1",
      name: "Grand Palace Banquet",
      location: formData.city || "Your City",
      capacity: "200-500 guests",
      price: "₹2,00,000",
      rating: 4.8,
    },
    {
      id: "2",
      name: "Royal Garden Resort",
      location: formData.city || "Your City",
      capacity: "300-600 guests",
      price: "₹3,50,000",
      rating: 4.9,
    },
    {
      id: "3",
      name: "Luxury Grand Hotel",
      location: formData.city || "Your City",
      capacity: "150-400 guests",
      price: "₹2,75,000",
      rating: 4.7,
    },
  ];

  const recommendedVendors = [
    {
      id: "1",
      name: "Royal Catering Services",
      category: "Catering",
      price: "₹800-1500/plate",
      rating: 4.9,
    },
    {
      id: "2",
      name: "Lens & Light Photography",
      category: "Photography",
      price: "₹50,000-2L",
      rating: 4.8,
    },
    {
      id: "3",
      name: "Elegant Decor Studio",
      category: "Decor",
      price: "₹1L-5L",
      rating: 4.7,
    },
    {
      id: "4",
      name: "Beats & Rhythm DJ",
      category: "DJ & Music",
      price: "₹25,000-75,000",
      rating: 4.9,
    },
  ];

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const steps = [
    { number: 1, title: "Event Type", icon: Calendar },
    { number: 2, title: "Guest Count", icon: Users },
    { number: 3, title: "Budget", icon: DollarSign },
    { number: 4, title: "Location & Date", icon: MapPin },
    { number: 5, title: "Venue Suggestions", icon: HomeIcon },
    { number: 6, title: "Vendor Recommendations", icon: ShoppingBag },
  ];

  return (
    <SwipeTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000]">
        <Navbar />

        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-serif text-white mb-4">
                Plan Your <span className="text-[#C6A14A]">Perfect Event</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Let us help you create an unforgettable experience with
                personalized recommendations
              </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12"
            >
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-white/10">
                  <motion.div
                    className="h-full bg-[#C6A14A]"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Step Indicators */}
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.number;
                  const isCurrent = currentStep === step.number;

                  return (
                    <div
                      key={step.number}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCompleted
                            ? "bg-[#C6A14A] text-black"
                            : isCurrent
                            ? "bg-[#C6A14A] text-black ring-4 ring-[#C6A14A]/30"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Icon size={18} />
                        )}
                      </div>
                      <p
                        className={`text-xs hidden sm:block ${
                          isCurrent
                            ? "text-white font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-8 border border-[#C6A14A]/20 min-h-[500px]"
              >
                {/* Step 1: Event Type */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                      What type of event are you planning?
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Select the type of event to get personalized recommendations
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eventTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() =>
                            setFormData({ ...formData, eventType: type.id })
                          }
                          className={`p-6 rounded-lg border-2 transition-all text-left ${
                            formData.eventType === type.id
                              ? "border-[#C6A14A] bg-[#C6A14A]/10"
                              : "border-white/20 hover:border-[#C6A14A]/50"
                          }`}
                        >
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {type.name}
                          </h3>
                          <p className="text-sm text-gray-400">{type.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Guest Count */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                      How many guests are you expecting?
                    </h2>
                    <p className="text-gray-400 mb-8">
                      This helps us recommend appropriate venues
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {guestRanges.map((range) => (
                        <button
                          key={range.id}
                          onClick={() =>
                            setFormData({ ...formData, guestCount: range.id })
                          }
                          className={`p-8 rounded-lg border-2 transition-all ${
                            formData.guestCount === range.id
                              ? "border-[#C6A14A] bg-[#C6A14A]/10"
                              : "border-white/20 hover:border-[#C6A14A]/50"
                          }`}
                        >
                          <div className="text-4xl mb-3">{range.icon}</div>
                          <h3 className="text-xl font-semibold text-white">
                            {range.label}
                          </h3>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Budget */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                      What&apos;s your estimated budget?
                    </h2>
                    <p className="text-gray-400 mb-8">
                      We&apos;ll match you with options that fit your budget
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {budgetRanges.map((range) => (
                        <button
                          key={range.id}
                          onClick={() =>
                            setFormData({ ...formData, budget: range.id })
                          }
                          className={`p-6 rounded-lg border-2 transition-all text-left ${
                            formData.budget === range.id
                              ? "border-[#C6A14A] bg-[#C6A14A]/10"
                              : "border-white/20 hover:border-[#C6A14A]/50"
                          }`}
                        >
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {range.label}
                          </h3>
                          <p className="text-sm text-gray-400">{range.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Location & Date */}
                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                      Where and when is your event?
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Help us find available venues and vendors in your area
                    </p>
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Select City*
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-4 outline-none border-2 border-white/20 focus:border-[#C6A14A] transition-colors"
                        >
                          <option value="" className="bg-black">
                            Choose a city
                          </option>
                          {cities.map((city) => (
                            <option key={city} value={city} className="bg-black">
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Event Date*
                        </label>
                        <input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              eventDate: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-4 outline-none border-2 border-white/20 focus:border-[#C6A14A] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Preferred Venue Type (Optional)
                        </label>
                        <select
                          value={formData.preferences.venueType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preferences: {
                                ...formData.preferences,
                                venueType: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-4 outline-none border-2 border-white/20 focus:border-[#C6A14A] transition-colors"
                        >
                          <option value="" className="bg-black">
                            Any type
                          </option>
                          {venueTypes.map((type) => (
                            <option key={type} value={type} className="bg-black">
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Venue Suggestions */}
                {currentStep === 5 && (
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                      Recommended Venues for You
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Based on your preferences, here are our top picks
                    </p>
                    <div className="space-y-4">
                      {recommendedVenues.map((venue) => (
                        <Link
                          key={venue.id}
                          href={`/venues/${venue.id}`}
                          className="block"
                        >
                          <div className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-[#C6A14A] transition-all group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#C6A14A] transition-colors">
                                  {venue.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {venue.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {venue.capacity}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles
                                    size={16}
                                    className="text-[#C6A14A]"
                                  />
                                  <span className="text-white font-semibold">
                                    {venue.rating}
                                  </span>
                                </div>
                                <p className="text-xl font-bold text-[#C6A14A]">
                                  {venue.price}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href="/venues">
                      <button className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/20">
                        Browse All Venues
                      </button>
                    </Link>
                  </div>
                )}

                {/* Step 6: Vendor Recommendations */}
                {currentStep === 6 && (
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">
                      Recommended Vendors for You
                    </h2>
                    <p className="text-gray-400 mb-8">
                      Complete your event with these trusted professionals
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {recommendedVendors.map((vendor) => (
                        <Link
                          key={vendor.id}
                          href={`/vendors/${vendor.id}`}
                          className="block"
                        >
                          <div className="bg-white/5 rounded-lg p-5 border border-white/10 hover:border-[#C6A14A] transition-all group">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs bg-[#C6A14A]/20 text-[#C6A14A] px-3 py-1 rounded-full">
                                {vendor.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <Sparkles
                                  size={14}
                                  className="text-[#C6A14A]"
                                />
                                <span className="text-white text-sm font-semibold">
                                  {vendor.rating}
                                </span>
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#C6A14A] transition-colors">
                              {vendor.name}
                            </h3>
                            <p className="text-[#C6A14A] font-semibold">
                              {vendor.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href="/vendors">
                      <button className="mt-2 w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/20">
                        Browse All Vendors
                      </button>
                    </Link>
                    <div className="mt-6 p-6 bg-[#C6A14A]/10 border border-[#C6A14A] rounded-lg text-center">
                      <CheckCircle
                        size={48}
                        className="text-[#C6A14A] mx-auto mb-3"
                      />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Planning Complete!
                      </h3>
                      <p className="text-gray-300 mb-4">
                        You can now save these recommendations and reach out to
                        vendors
                      </p>
                      <Link href="/dashboard">
                        <button className="px-8 py-3 bg-[#C6A14A] hover:bg-[#E8C56B] text-black font-semibold rounded-lg transition-colors">
                          Go to Dashboard
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-between items-center mt-8"
            >
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === 1
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              {currentStep < 6 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !formData.eventType) ||
                    (currentStep === 2 && !formData.guestCount) ||
                    (currentStep === 3 && !formData.budget) ||
                    (currentStep === 4 &&
                      (!formData.city || !formData.eventDate))
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    (currentStep === 1 && !formData.eventType) ||
                    (currentStep === 2 && !formData.guestCount) ||
                    (currentStep === 3 && !formData.budget) ||
                    (currentStep === 4 &&
                      (!formData.city || !formData.eventDate))
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-[#C6A14A] text-black hover:bg-[#E8C56B]"
                  }`}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              ) : (
                <Link href="/">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#C6A14A] hover:bg-[#E8C56B] text-black rounded-lg font-semibold transition-colors">
                    Start Planning Another Event
                  </button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
