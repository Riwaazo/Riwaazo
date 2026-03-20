"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

export default function BudgetCalculator() {
  const [totalBudget, setTotalBudget] = useState(1000000);

  // always format using a fixed locale to avoid hydration discrepancies
  const formatAmount = (num: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);

  const budgetBreakdown = [
    { category: "Venue", percentage: 30, color: "#C6A14A" },
    { category: "Catering", percentage: 25, color: "#E8C56B" },
    { category: "Decor", percentage: 20, color: "#D4AF37" },
    { category: "Entertainment", percentage: 15, color: "#C6A14A" },
    { category: "Others", percentage: 10, color: "#8B7F47" },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#5A0000] border-t-8 border-[#C6A14A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif text-white mb-4">
            Smart Budget <span className="text-[#C6A14A]">Intelligence</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            AI-powered budget planning for your perfect event
          </p>
        </motion.div>

        {/* Budget Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-[#8B0000] to-[#6A0000] border border-[#C6A14A]/30 rounded-2xl p-8 sm:p-12">
            {/* Budget Input */}
            <div className="mb-8">
              <label className="text-gray-400 text-sm mb-3 block">
                Total Budget
              </label>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-serif text-[#C6A14A]">
                  ₹{(totalBudget / 100000).toFixed(1)}L
                </span>
                <input
                  type="range"
                  min="500000"
                  max="5000000"
                  step="100000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#C6A14A]"
                />
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="space-y-6">
              {budgetBreakdown.map((item, idx) => {
                const amount = (totalBudget * item.percentage) / 100;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    {/* Category */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[#C6A14A] font-bold">
                        ₹{formatAmount(amount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-[#6A0000] rounded-full overflow-hidden border border-[#8B0000]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        style={{ backgroundColor: item.color }}
                        className="h-full rounded-full"
                      />
                    </div>

                    {/* Percentage */}
                    <div className="text-gray-500 text-xs mt-1">
                      {item.percentage}% of budget
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <Link
              href="/budget"
              className="w-full mt-10 inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors"
            >
              <BarChart3 size={20} />
              Create Your Budget Plan
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
