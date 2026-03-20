"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, Camera, Music, ClipboardList, Palette } from "lucide-react";

const iconMap = [UtensilsCrossed, Sparkles, Camera, Music, ClipboardList, Palette];

type ProfessionalCategory = {
  name: string;
  description: string;
  count: number;
};

type CuratedProfessionalsProps = {
  categories: ProfessionalCategory[];
  totalVendors: number;
};

export default function CuratedProfessionals({ categories, totalVendors }: Readonly<CuratedProfessionalsProps>) {
  const professionals = categories.map((category, index) => ({
    id: `${category.name}-${index}`,
    ...category,
    icon: iconMap[index % iconMap.length],
  }));

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3A0000] via-[#4A0000] to-[#2a0000] border-t-8 border-[#C6A14A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif text-white mb-4">
            Curated <span className="text-[#C6A14A]">Professionals</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Verified vendors and service providers across {Math.max(totalVendors, 0)} active profiles
          </p>
        </motion.div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {professionals.map((prof, idx) => {
            const Icon = prof.icon;
            return (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                {/* Card */}
                <div className="bg-[#8B0000] rounded-lg p-8 text-center hover:bg-[#9B0000] transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-[#6A0000] rounded-lg group-hover:bg-[#C6A14A]/20 transition-colors duration-300">
                      <Icon
                        size={40}
                        className="text-gray-400 group-hover:text-[#C6A14A] transition-colors duration-300"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {prof.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{prof.description}</p>
                  <p className="text-[#C6A14A] text-xs mb-6">{prof.count} verified partners</p>

                  {/* CTA */}
                  <Link
                    href="/vendors"
                    className="text-[#C6A14A] font-semibold text-sm hover:text-[#E8C56B] transition-colors"
                  >
                    Browse {prof.name} →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {professionals.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-gray-300">
            Vendor categories will appear here once approved professionals are published.
          </div>
        )}
      </div>
    </section>
  );
}
