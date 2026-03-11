"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { UtensilsCrossed, Sparkles, Camera, Music, ClipboardList, Palette } from "lucide-react";

const professionals = [
  {
    id: 1,
    name: "Catering",
    icon: UtensilsCrossed,
    description: "Premium culinary experiences",
  },
  {
    id: 2,
    name: "Decor",
    icon: Sparkles,
    description: "Stunning event aesthetics",
  },
  {
    id: 3,
    name: "Photography",
    icon: Camera,
    description: "Capture your moments",
  },
  {
    id: 4,
    name: "Music & Entertainment",
    icon: Music,
    description: "Live performances & DJs",
  },
  {
    id: 5,
    name: "Event Planning",
    icon: ClipboardList,
    description: "Complete coordination",
  },
  {
    id: 6,
    name: "Makeup & Styling",
    icon: Palette,
    description: "Professional beauty services",
  },
];

export default function CuratedProfessionals() {
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
            Verified vendors and service providers for every aspect of your event
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
                  <p className="text-gray-400 text-sm mb-6">{prof.description}</p>

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
      </div>
    </section>
  );
}
