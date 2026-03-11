import { CheckCircle, Calendar, Users, MapPin, Sparkles, Phone } from "lucide-react";
import SwipeTransition from "@/components/layout/SwipeTransition";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";

const perks = [
  {
    icon: CheckCircle,
    title: "Verified vendor network",
    description: "Access curated venues, caterers, decor, photo/video, and entertainment partners.",
  },
  {
    icon: Calendar,
    title: "Smart planning tools",
    description: "Use our planner and budget flows with your clients to keep everyone aligned.",
  },
  {
    icon: Users,
    title: "Lead routing",
    description: "Get matched with hosts looking for end-to-end planning support.",
  },
  {
    icon: MapPin,
    title: "City coverage",
    description: "Preferred access across major metros with on-ground concierge support.",
  },
  {
    icon: Sparkles,
    title: "Showcase portfolio",
    description: "Highlight signature events to stand out in searches.",
  },
  {
    icon: Phone,
    title: "Concierge help",
    description: "Dedicated partner success to resolve ops and booking queries fast.",
  },
];

export default function EventPlannersPage() {
  return (
    <SwipeTransition>
      <Navbar />
      <main className="bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000] text-white min-h-screen pt-24 pb-20">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr] items-center">
            <div className="space-y-6">
              <p className="uppercase text-xs tracking-[0.25em] text-[#C6A14A]">For planners</p>
              <h1 className="text-4xl sm:text-5xl font-serif leading-tight">
                Join Riwaazo as an <span className="text-[#C6A14A]">Event Planner</span>
              </h1>
              <p className="text-gray-200 max-w-2xl">
                Get qualified leads, book premium venues faster, and manage budgets with our built-in tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup?role=planner"
                  className="px-6 py-3 bg-[#C6A14A] text-black font-semibold rounded-lg hover:bg-[#E8C56B] transition-colors text-center"
                >
                  Create planner account
                </Link>
                <Link
                  href="/planner"
                  className="px-6 py-3 border border-[#C6A14A] text-[#C6A14A] font-semibold rounded-lg hover:bg-[#C6A14A]/10 transition-colors text-center"
                >
                  Try planning tools
                </Link>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur">
              <h2 className="text-xl font-serif mb-4">Why planners choose us</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {perks.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-[#C6A14A] mb-2">
                      <Icon size={18} />
                      <span className="font-semibold text-white">{title}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </SwipeTransition>
  );
}
