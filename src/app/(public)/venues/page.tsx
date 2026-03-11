"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Users,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const venues = [
  {
    id: "1",
    name: "Royal Palace Heritage",
    location: "New Delhi",
    price: 500000,
    rating: 4.9,
    reviews: 128,
    capacity: "500-1000",
    type: "indoor",
    image: "bg-gradient-to-br from-[#8B0000] to-[#5A0000]",
  },
  {
    id: "2",
    name: "Garden Vista Luxury",
    location: "Mumbai",
    price: 450000,
    rating: 4.8,
    reviews: 95,
    capacity: "300-600",
    type: "outdoor",
    image: "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
  },
  {
    id: "3",
    name: "Metropolitan Elegance",
    location: "Bangalore",
    price: 380000,
    rating: 4.7,
    reviews: 87,
    capacity: "200-400",
    type: "indoor",
    image: "bg-gradient-to-br from-[#9B0000] to-[#5A0000]",
  },
  {
    id: "4",
    name: "Lake Side Manor",
    location: "Hyderabad",
    price: 420000,
    rating: 4.9,
    reviews: 112,
    capacity: "400-800",
    type: "outdoor",
    image: "bg-gradient-to-br from-[#8B0000] to-[#6A0000]",
  },
  {
    id: "5",
    name: "Grand Ballroom",
    location: "Chennai",
    price: 550000,
    rating: 4.8,
    reviews: 104,
    capacity: "600-1200",
    type: "indoor",
    image: "bg-gradient-to-br from-[#9A0000] to-[#6A0000]",
  },
  {
    id: "6",
    name: "Sunset Gardens",
    location: "Pune",
    price: 350000,
    rating: 4.6,
    reviews: 78,
    capacity: "250-500",
    type: "outdoor",
    image: "bg-gradient-to-br from-[#7A0000] to-[#5A0000]",
  },
];

export default function VenuesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const cities = ["all", "New Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune"];
  const types = ["all", "indoor", "outdoor"];
  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under ₹4L", value: "0-400000" },
    { label: "₹4L - ₹5L", value: "400000-500000" },
    { label: "Above ₹5L", value: "500000-999999999" },
  ];

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity =
      selectedCity === "all" || venue.location === selectedCity;
    const matchesType =
      selectedType === "all" || venue.type === selectedType;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      matchesPrice = venue.price >= min && venue.price <= max;
    }

    return matchesSearch && matchesCity && matchesType && matchesPrice;
  });

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
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-serif text-white mb-4">
                Discover Your Perfect <span className="text-[#C6A14A]">Venue</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Browse through our curated selection of premium venues
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/venues/join"
                  className="px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  List your venue
                </Link>
                <Link
                  href="/auth/signup?role=venue-owner"
                  className="px-6 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
                >
                  Sign up now
                </Link>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-[#6A0000] to-[#4A0000] rounded-xl p-4 border border-[#C6A14A]/20">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20">
                    <Search size={20} className="text-[#C6A14A]" />
                    <input
                      type="text"
                      placeholder="Search venues by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                    />
                  </div>

                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal size={20} />
                    Filters
                  </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {/* City Filter */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        City
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 outline-none border border-white/20"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city} className="bg-black">
                            {city === "all" ? "All Cities" : city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Venue Type Filter */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Venue Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 outline-none border border-white/20"
                      >
                        {types.map((type) => (
                          <option key={type} value={type} className="bg-black">
                            {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Price Range
                      </label>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 outline-none border border-white/20"
                      >
                        {priceRanges.map((range) => (
                          <option key={range.value} value={range.value} className="bg-black">
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Results Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <p className="text-gray-400">
                Showing <span className="text-[#C6A14A] font-semibold">{filteredVenues.length}</span> venues
              </p>
            </motion.div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue, idx) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link href={`/venues/${venue.id}`}>
                    <div className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-[#C6A14A]/20 transition-all duration-300 border border-[#C6A14A]/20">
                        {/* Image */}
                        <div className={`h-48 ${venue.image} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute top-4 right-4 bg-[#C6A14A] text-black px-3 py-1 rounded-full text-sm font-semibold">
                            {venue.capacity}
                          </div>
                          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs capitalize">
                            {venue.type}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-[#C6A14A] transition-colors">
                            {venue.name}
                          </h3>

                          {/* Location */}
                          <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                            <MapPin size={16} className="text-[#C6A14A]" />
                            {venue.location}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star
                                size={14}
                                className="text-[#C6A14A] fill-[#C6A14A]"
                              />
                              <span className="text-white font-semibold">
                                {venue.rating}
                              </span>
                            </div>
                            <span className="text-gray-500 text-sm">
                              ({venue.reviews} reviews)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="border-t border-gray-700 pt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">
                                Starting from
                              </span>
                              <span className="text-[#C6A14A] font-semibold text-lg">
                                ₹{(venue.price / 100000).toFixed(1)}L
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredVenues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-400 text-lg">
                  No venues found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("all");
                    setSelectedType("all");
                    setPriceRange("all");
                  }}
                  className="mt-4 px-6 py-2 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </SwipeTransition>
  );
}
