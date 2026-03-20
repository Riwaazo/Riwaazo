"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Store, Building2, Shield } from "lucide-react";

const roles = [
  { key: "customer", label: "Customer", description: "Plan events, book venues & vendors.", icon: Users, href: "/auth/signup?role=user" },
  { key: "vendor", label: "Vendor", description: "Offer services and manage leads.", icon: Store, href: "/auth/signup?role=vendor" },
  { key: "venue", label: "Venue Owner", description: "Manage venue calendar and bookings.", icon: Building2, href: "/auth/signup?role=venue" },
  { key: "planner", label: "Event Planner", description: "Coordinate and manage events end-to-end.", icon: Shield, href: "/auth/signup?role=planner" },
];

export default function RoleSelection() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <p className="text-sm text-[#C6A14A] uppercase tracking-[0.25em] mb-2">Get started</p>
          <h1 className="text-3xl sm:text-4xl font-serif">Choose your role</h1>
          <p className="text-gray-400 mt-2">This will personalize your dashboard and permissions.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => router.push(role.href)}
                className="text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#C6A14A] transition-all hover:bg-white/[0.08] group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#C6A14A]/15 flex items-center justify-center text-[#C6A14A]">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </span>
                </div>
                <h3 className="text-lg font-semibold group-hover:text-[#C6A14A] transition-colors">{role.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{role.description}</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/auth/login" className="text-[#C6A14A] hover:text-[#E8C56B]">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}
