"use client";

import Link from "next/link";

const slots = [
  { id: "VC-01", title: "Site visit", date: "2024-03-12", status: "Confirmed" },
  { id: "VC-02", title: "Décor walkthrough", date: "2024-03-18", status: "Pending" },
];

export default function VenueCalendar() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Venue</p>
            <h1 className="text-3xl font-serif">Calendar</h1>
          </div>
          <Link href="/venue/dashboard" className="text-[#C6A14A] hover:text-[#E8C56B] text-sm">
            Back to dashboard
          </Link>
        </div>
        <div className="grid gap-4">
          {slots.map((slot) => (
            <div key={slot.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{slot.title}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">
                  {slot.status}
                </span>
              </div>
              <p className="text-sm text-gray-300">{slot.date}</p>
              <button className="mt-3 px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15 text-xs">
                Add reminder
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
