"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

type FeaturedVenue = {
  id: string;
  slug: string;
  name: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  capacity: string;
  image: string | null;
};

const fallbackGradients = [
  "bg-gradient-to-br from-[#8B0000] to-[#5A0000]",
  "bg-gradient-to-br from-[#7A0000] to-[#4A0000]",
  "bg-gradient-to-br from-[#9B0000] to-[#5A0000]",
  "bg-gradient-to-br from-[#8B0000] to-[#6A0000]",
];

type FeaturedVenuesProps = {
  venues: FeaturedVenue[];
};

export default function FeaturedVenues({ venues }: Readonly<FeaturedVenuesProps>) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000] border-t-8 border-[#C6A14A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif text-white mb-4">
            Featured <span className="text-[#C6A14A]">Venues</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Handpicked premium locations perfect for your celebrations
          </p>
        </motion.div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {venues.map((venue, idx) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group cursor-pointer"
            >

              {/* Card Container */}
              <motion.div
                className="rounded-lg overflow-hidden"
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <Link
                  href={`/venues/${venue.slug || venue.id}`}
                  className="block bg-gradient-to-br from-[#8B0000] to-[#5A0000] rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-[#C6A14A]/20 transition-all duration-300"
                >

                {/* Image */}
                <div className={`relative h-48 overflow-hidden ${venue.image ? "bg-[#5A0000]" : fallbackGradients[idx % fallbackGradients.length]}`}>
                  {venue.image && (
                    <Image
                      src={venue.image}
                      alt={venue.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 right-4 bg-[#C6A14A] text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {venue.capacity}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
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
                      <Star size={14} className="text-[#C6A14A] fill-[#C6A14A]" />
                      <span className="text-white font-semibold">{venue.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({venue.reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Starting from</span>
                      <span className="text-[#C6A14A] font-semibold">{venue.price}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <span className="w-full mt-4 inline-block text-center py-2 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors">
                    View Details
                  </span>
                </div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {venues.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-gray-300">
            Featured venues will appear here once approved listings are available.
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/venues"
            className="px-8 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors inline-block"
          >
            Explore All Venues
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
