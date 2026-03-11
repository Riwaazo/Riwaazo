"use client";

import Link from "next/link";

const roles = [
  { key: "customer", label: "Customer", description: "Plan events, book venues & vendors." },
  { key: "vendor", label: "Vendor", description: "Offer services and manage leads." },
  { key: "venue", label: "Venue Owner", description: "Manage venue calendar and bookings." },
  { key: "admin", label: "Admin", description: "Platform oversight." },
];

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className="text-sm text-gray-300">Step 2</p>
          <h1 className="text-3xl font-serif">Choose your role</h1>
          <p className="text-gray-400">This will personalize your dashboard and permissions.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <button
              key={role.key}
              className="text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#C6A14A] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{role.label}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">
                  Select
                </span>
              </div>
              <p className="text-sm text-gray-300">{role.description}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/auth/signup" className="text-[#C6A14A] hover:text-[#E8C56B]">Back</Link>
          <span className="text-gray-500">·</span>
          <Link href="/dashboard" className="text-[#C6A14A] hover:text-[#E8C56B]">Continue to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
