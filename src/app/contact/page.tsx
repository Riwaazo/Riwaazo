"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, MessageSquare, CheckCircle } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const contactChannels = [
  {
    icon: Mail,
    title: "Email",
    value: "hello@riwaazo.com",
    description: "We reply within one business day",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 98765 43210",
    description: "Mon–Sat, 9:00–18:00 IST",
  },
  {
    icon: MessageSquare,
    title: "Chat",
    value: "Live concierge support",
    description: "Perfect for quick venue questions",
  },
  {
    icon: MapPin,
    title: "Studio",
    value: "Connaught Place, New Delhi",
    description: "Visit our experience lounge",
  },
];

function ContactContent() {
  const searchParams = useSearchParams();
  const plannerUserId = searchParams.get("plannerUserId");
  const plannerName = searchParams.get("plannerName");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          date: fd.get("date"),
          eventType: fd.get("eventType"),
          guests: fd.get("guests"),
          message: fd.get("message"),
          ...(plannerUserId ? { plannerUserId } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SwipeTransition>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000] pb-16 pt-24 text-white sm:pb-20 sm:pt-28">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr] lg:gap-10">
            <div className="space-y-6">
              <p className="uppercase tracking-[0.3em] text-sm text-[#C6A14A]">Contact</p>
              <h1 className="text-3xl font-serif sm:text-4xl lg:text-5xl">
                {plannerName ? `Get in touch with ${plannerName}` : "Tell us about your event."}
              </h1>
              <p className="text-gray-300 max-w-2xl">
                {plannerName
                  ? `Fill out the form below and ${plannerName} will receive your inquiry directly.`
                  : "Share your vision and our concierge team will curate the right venues and vendors for you."}
              </p>

              {sent ? (
                <div className="bg-white/5 border border-green-500/30 rounded-2xl p-8 text-center space-y-3">
                  <CheckCircle className="mx-auto text-green-400" size={48} />
                  <h2 className="text-2xl font-serif">Inquiry sent!</h2>
                  <p className="text-gray-300">Our concierge team will get back to you within one business day.</p>
                  <button onClick={() => setSent(false)} className="text-[#C6A14A] underline text-sm mt-2">
                    Send another inquiry
                  </button>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg backdrop-blur">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-200">Full name</span>
                    <input
                      name="name"
                      placeholder="Priya Sharma"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-200">Email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-200">Phone</span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-200">Event date</span>
                    <input
                      type="date"
                      name="date"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm block">
                  <span className="text-gray-200">Event type</span>
                  <select
                    name="eventType"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-[#C6A14A] focus:outline-none"
                    defaultValue="wedding"
                  >
                    <option className="bg-[#2a0000]" value="wedding">Wedding</option>
                    <option className="bg-[#2a0000]" value="engagement">Engagement</option>
                    <option className="bg-[#2a0000]" value="corporate">Corporate</option>
                    <option className="bg-[#2a0000]" value="social">Social</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm block">
                  <span className="text-gray-200">Guest count</span>
                  <input
                    type="number"
                    name="guests"
                    min={10}
                    placeholder="200"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm block">
                  <span className="text-gray-200">What do you need?</span>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell us about venues, catering, decor, and anything else you have in mind."
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-gray-500 focus:border-[#C6A14A] focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-[#C6A14A] text-black font-semibold px-5 py-3 rounded-lg hover:bg-[#E8C56B] transition-colors disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send to concierge"}
                </button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </form>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur">
                <h2 className="text-xl font-serif mb-3">Talk to a human</h2>
                <p className="text-gray-300 mb-4">
                  We pair you with a specialist who knows venues, vendors, and local regulations.
                </p>
                <div className="space-y-4">
                  {contactChannels.map(({ icon: Icon, title, value, description }) => (
                    <div
                      key={title}
                      className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="p-2 rounded-lg bg-[#C6A14A]/20 text-[#C6A14A]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">{title}</p>
                        <p className="text-lg font-medium">{value}</p>
                        <p className="text-sm text-gray-400">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-lg backdrop-blur">
                <h3 className="text-lg font-serif mb-2">Prefer WhatsApp?</h3>
                <p className="text-gray-300 mb-4">
                  Message us and we will share curated venue options within the hour.
                </p>
                <a
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors"
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                >
                  Start chat
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </SwipeTransition>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000]" />}>
      <ContactContent />
    </Suspense>
  );
}
