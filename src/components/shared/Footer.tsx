"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  const FooterLinks = {
    Company: ["About Us", "Careers", "Press", "Blog"],
    Cities: ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai"],
    Explore: ["Venues", "Vendors", "Planning Tools", "Budget Calculator"],
    Support: ["Help Center", "Contact Us", "Sustainability", "Terms of Service"],
  };

  return (
    <footer className="bg-gradient-to-b from-[#2A0000] to-[#1A0000] border-t-8 border-[#C6A14A]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-serif text-[#C6A14A] mb-4">Riwaazo</h3>
            <p className="text-gray-400 text-sm mb-6">
              Event infrastructure for modern India. Book venues, vendors, and plan seamlessly.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400 hover:text-[#C6A14A] transition-colors cursor-pointer">
                <Mail size={16} />
                <span className="text-sm">hello@riwaazo.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 hover:text-[#C6A14A] transition-colors cursor-pointer">
                <Phone size={16} />
                <span className="text-sm">+91 1800-RIWAAZO</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Sections */}
          {Object.entries(FooterLinks).map((entry, idx) => {
            const [title, links] = entry;
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              >
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-400 text-sm hover:text-[#C6A14A] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-[#C6A14A]/20 my-8" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            © 2026 Riwaazo. All rights reserved.
          </p>

          {/* Social Links (Optional) */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-[#C6A14A] transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-[#C6A14A] transition-colors text-sm"
            >
              Terms & Conditions
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
