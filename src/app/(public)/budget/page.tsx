"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Share2,
} from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

interface BudgetCategory {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

export default function BudgetCalculator() {
  const [eventType, setEventType] = useState("wedding");
  const [guestCount, setGuestCount] = useState(200);
  const [totalBudget, setTotalBudget] = useState(1000000);

  const eventTypes = [
    { id: "wedding", name: "Wedding", icon: "💍" },
    { id: "engagement", name: "Engagement", icon: "💑" },
    { id: "reception", name: "Reception", icon: "🎉" },
    { id: "sangeet", name: "Sangeet", icon: "🎵" },
    { id: "corporate", name: "Corporate Event", icon: "💼" },
  ];

  const budgetCategories: Record<string, BudgetCategory[]> = {
    wedding: [
      {
        name: "Venue",
        percentage: 25,
        color: "#C6A14A",
        description: "Booking charges, decoration, seating",
      },
      {
        name: "Catering",
        percentage: 30,
        color: "#9B7035",
        description: "Food, beverages, service staff",
      },
      {
        name: "Photography & Videography",
        percentage: 15,
        color: "#8B6020",
        description: "Professional coverage, albums, videos",
      },
      {
        name: "Decor & Lighting",
        percentage: 10,
        color: "#7A5015",
        description: "Floral arrangements, stage, ambiance",
      },
      {
        name: "Entertainment",
        percentage: 8,
        color: "#6A4010",
        description: "DJ, live music, performers",
      },
      {
        name: "Attire & Beauty",
        percentage: 7,
        color: "#5A3010",
        description: "Outfits, makeup, accessories",
      },
      {
        name: "Miscellaneous",
        percentage: 5,
        color: "#4A2010",
        description: "Invitations, gifts, transportation",
      },
    ],
    engagement: [
      {
        name: "Venue",
        percentage: 20,
        color: "#C6A14A",
        description: "Booking charges, basic decoration",
      },
      {
        name: "Catering",
        percentage: 35,
        color: "#9B7035",
        description: "Food and beverages",
      },
      {
        name: "Photography",
        percentage: 20,
        color: "#8B6020",
        description: "Professional photography",
      },
      {
        name: "Decor",
        percentage: 15,
        color: "#7A5015",
        description: "Floral and stage decoration",
      },
      {
        name: "Miscellaneous",
        percentage: 10,
        color: "#6A4010",
        description: "Invitations, gifts, attire",
      },
    ],
    reception: [
      {
        name: "Venue",
        percentage: 25,
        color: "#C6A14A",
        description: "Banquet hall booking",
      },
      {
        name: "Catering",
        percentage: 35,
        color: "#9B7035",
        description: "Dinner and bar service",
      },
      {
        name: "Entertainment",
        percentage: 15,
        color: "#8B6020",
        description: "DJ, live band, dance floor",
      },
      {
        name: "Decor",
        percentage: 15,
        color: "#7A5015",
        description: "Lighting and decoration",
      },
      {
        name: "Miscellaneous",
        percentage: 10,
        color: "#6A4010",
        description: "Photography, video, gifts",
      },
    ],
    sangeet: [
      {
        name: "Venue",
        percentage: 20,
        color: "#C6A14A",
        description: "Hall rental and setup",
      },
      {
        name: "Entertainment",
        percentage: 30,
        color: "#9B7035",
        description: "DJ, choreographer, performers",
      },
      {
        name: "Catering",
        percentage: 25,
        color: "#8B6020",
        description: "Snacks and beverages",
      },
      {
        name: "Decor & Lighting",
        percentage: 15,
        color: "#7A5015",
        description: "Stage, lights, ambiance",
      },
      {
        name: "Miscellaneous",
        percentage: 10,
        color: "#6A4010",
        description: "Attire, accessories, gifts",
      },
    ],
    corporate: [
      {
        name: "Venue",
        percentage: 30,
        color: "#C6A14A",
        description: "Conference hall, AV equipment",
      },
      {
        name: "Catering",
        percentage: 25,
        color: "#9B7035",
        description: "Meals, refreshments, service",
      },
      {
        name: "Technology & AV",
        percentage: 20,
        color: "#8B6020",
        description: "Sound, projection, recording",
      },
      {
        name: "Branding & Decor",
        percentage: 15,
        color: "#7A5015",
        description: "Banners, stage setup, signage",
      },
      {
        name: "Miscellaneous",
        percentage: 10,
        color: "#6A4010",
        description: "Materials, gifts, transport",
      },
    ],
  };

  const breakdown = budgetCategories[eventType] || budgetCategories.wedding;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const perGuestCost = totalBudget / guestCount;
  const avgPerGuestCost = 5000; // Industry average

  const getBudgetStatus = () => {
    if (perGuestCost > avgPerGuestCost * 1.5) {
      return {
        status: "Luxury",
        icon: TrendingUp,
        color: "text-green-400",
        message: "Your budget is above the premium range",
      };
    } else if (perGuestCost > avgPerGuestCost) {
      return {
        status: "Premium",
        icon: CheckCircle,
        color: "text-[#C6A14A]",
        message: "Your budget is in the premium range",
      };
    } else if (perGuestCost > avgPerGuestCost * 0.6) {
      return {
        status: "Moderate",
        icon: CheckCircle,
        color: "text-blue-400",
        message: "Your budget is moderate and well-balanced",
      };
    } else {
      return {
        status: "Budget-Friendly",
        icon: AlertCircle,
        color: "text-yellow-400",
        message: "Consider increasing budget for better options",
      };
    }
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

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
                Budget <span className="text-[#C6A14A]">Calculator</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Plan your event finances with detailed breakdown and smart
                recommendations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Input Panel */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20 sticky top-24"
                >
                  <h2 className="text-xl font-serif text-white mb-6">
                    Event Details
                  </h2>

                  <div className="space-y-6">
                    {/* Event Type */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Event Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {eventTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setEventType(type.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-center ${
                              eventType === type.id
                                ? "border-[#C6A14A] bg-[#C6A14A]/10"
                                : "border-white/20 hover:border-[#C6A14A]/50"
                            }`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <p className="text-xs text-white">{type.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guest Count */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block flex items-center gap-2">
                        <Users size={16} />
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={guestCount}
                        onChange={(e) =>
                          setGuestCount(Number(e.target.value) || 0)
                        }
                        className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border-2 border-white/20 focus:border-[#C6A14A] transition-colors"
                      />
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full mt-2"
                      />
                    </div>

                    {/* Total Budget */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block flex items-center gap-2">
                        <DollarSign size={16} />
                        Total Budget (₹)
                      </label>
                      <input
                        type="number"
                        min="10000"
                        max="100000000"
                        step="10000"
                        value={totalBudget}
                        onChange={(e) =>
                          setTotalBudget(Number(e.target.value) || 0)
                        }
                        className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg px-4 py-3 outline-none border-2 border-white/20 focus:border-[#C6A14A] transition-colors"
                      />
                      <input
                        type="range"
                        min="100000"
                        max="10000000"
                        step="100000"
                        value={totalBudget}
                        onChange={(e) =>
                          setTotalBudget(Number(e.target.value))
                        }
                        className="w-full mt-2"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatAmount(totalBudget)}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="pt-6 border-t border-white/20 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Per Guest Cost
                        </span>
                        <span className="text-white font-semibold">
                          {formatAmount(perGuestCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Industry Avg.
                        </span>
                        <span className="text-gray-300">
                          {formatAmount(avgPerGuestCost)}
                        </span>
                      </div>
                    </div>

                    {/* Budget Status */}
                    <div
                      className={`p-4 rounded-lg bg-white/5 border border-white/10`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon
                          size={20}
                          className={budgetStatus.color}
                        />
                        <span
                          className={`font-semibold ${budgetStatus.color}`}
                        >
                          {budgetStatus.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {budgetStatus.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Budget Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-white">
                      Budget Breakdown
                    </h2>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <Download size={20} className="text-white" />
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        <Share2 size={20} className="text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {breakdown.map((category, idx) => {
                      const amount = (totalBudget * category.percentage) / 100;
                      return (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {category.name}
                              </h3>
                              <p className="text-xs text-gray-400">
                                {category.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xl font-bold text-[#C6A14A]">
                                {formatAmount(amount)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {category.percentage}%
                              </p>
                            </div>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${category.percentage}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Tips & Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-xl p-6 border border-[#C6A14A]/20"
                >
                  <h2 className="text-2xl font-serif text-white mb-4">
                    Smart Tips
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-gray-300">
                      <CheckCircle
                        size={20}
                        className="text-[#C6A14A] flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm">
                        Book vendors 6-8 months in advance for better rates and
                        availability
                      </p>
                    </div>
                    <div className="flex items-start gap-3 text-gray-300">
                      <CheckCircle
                        size={20}
                        className="text-[#C6A14A] flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm">
                        Allocate 5-10% extra for unexpected expenses and
                        last-minute changes
                      </p>
                    </div>
                    <div className="flex items-start gap-3 text-gray-300">
                      <CheckCircle
                        size={20}
                        className="text-[#C6A14A] flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm">
                        Consider off-season dates (July-September) for
                        significant cost savings
                      </p>
                    </div>
                    <div className="flex items-start gap-3 text-gray-300">
                      <CheckCircle
                        size={20}
                        className="text-[#C6A14A] flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm">
                        Always get quotes from multiple vendors and negotiate
                        package deals
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-r from-[#C6A14A] to-[#9B7035] rounded-xl p-8 text-center"
                >
                  <h3 className="text-2xl font-serif text-black mb-2">
                    Ready to Start Planning?
                  </h3>
                  <p className="text-black/70 mb-6">
                    Let us help you find the perfect vendors within your budget
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="/planner"
                      className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/80 transition-colors"
                    >
                      Start Event Planner
                    </a>
                    <a
                      href="/venues"
                      className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Browse Venues
                    </a>
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
