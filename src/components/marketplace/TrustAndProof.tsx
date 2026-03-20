"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle, MapPin, Headphones, Star } from "lucide-react";
import { useState } from "react";

type TrustAndProofProps = {
  stats?: {
    venues: number;
    vendors: number;
    cities: number;
  };
};

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    event: "Wedding - 500 guests",
    text: "Riwaazo made our wedding planning stress-free. The escrow protection gave us complete peace of mind.",
    rating: 5,
    avatar: "PS",
  },
  {
    id: 2,
    name: "Amit Patel",
    event: "Corporate Event - 200 attendees",
    text: "Incredible platform. Found the perfect venue and vendor coordination was seamless.",
    rating: 5,
    avatar: "AP",
  },
  {
    id: 3,
    name: "Anjali Iyer",
    event: "Birthday Celebration - 150 guests",
    text: "Best event planning experience I've had. Everything was organized and professional.",
    rating: 5,
    avatar: "AI",
  },
];

export default function TrustAndProof({ stats }: Readonly<TrustAndProofProps>) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const trustSignals = [
    {
      id: 1,
      icon: Shield,
      title: "Escrow Protection",
      description: "Your payments protected until event completion",
    },
    {
      id: 2,
      icon: CheckCircle,
      title: "Verified Vendors",
      description: `${stats?.vendors || 0}+ approved partners ready to deliver`,
    },
    {
      id: 3,
      icon: MapPin,
      title: "City Verified Hosts",
      description: `${Math.max(stats?.cities || 0, 1)} active city markets with premium venues`,
    },
    {
      id: 4,
      icon: Headphones,
      title: "24/7 Support",
      description: `${stats?.venues || 0}+ listings backed by guided booking support`,
    },
  ];

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
            Why Trust <span className="text-[#C6A14A]">Riwaazo</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Trusted by thousands for seamless, secure event planning
          </p>
        </motion.div>

        {/* Trust Signals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustSignals.map((signal, idx) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="bg-[#8B0000] rounded-lg p-6 border border-[#9B0000] hover:border-[#C6A14A]/50 transition-colors"
              >
                <div className="mb-4">
                  <Icon size={32} className="text-[#C6A14A]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {signal.title}
                </h3>
                <p className="text-gray-400 text-sm">{signal.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-[#8B0000] to-[#6A0000] border border-[#C6A14A]/30 rounded-2xl p-8 sm:p-12">
            {/* Current Testimonial */}
            <div className="min-h-64 flex flex-col justify-between">
              {/* Text */}
              <div>
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map(
                    (_, i) => (
                      <Star
                        key={`${testimonials[currentTestimonial].id}-star-${i + 1}`}
                        size={20}
                        className="text-[#C6A14A] fill-[#C6A14A]"
                      />
                    )
                  )}
                </div>
                <p className="text-xl text-white mb-8 leading-relaxed font-light">
                  &ldquo;{testimonials[currentTestimonial].text}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="border-t border-[#8B0000] pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C6A14A] text-black rounded-full flex items-center justify-center font-bold">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {testimonials[currentTestimonial].event}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() =>
                  setCurrentTestimonial(
                    (prev) =>
                      (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
                className="px-4 py-2 border border-[#C6A14A] text-[#C6A14A] rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={`testimonial-dot-${testimonials[idx].id}`}
                    onClick={() => setCurrentTestimonial(idx)}
                    title={`Show testimonial from ${testimonials[idx].name}`}
                    className={idx === currentTestimonial ? "w-2 h-2 rounded-full transition-colors bg-[#C6A14A]" : "w-2 h-2 rounded-full transition-colors bg-gray-700 hover:bg-gray-500"}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
                }
                className="px-4 py-2 border border-[#C6A14A] text-[#C6A14A] rounded-lg hover:bg-[#C6A14A]/10 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
