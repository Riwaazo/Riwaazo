"use client";

import Link from "next/link";

const sampleEvents = [
  { id: "ev-101", name: "Wedding Ceremony", date: "2024-06-15", status: "Planning" },
  { id: "ev-102", name: "Engagement Party", date: "2024-04-10", status: "Confirmed" },
];

export default function DashboardEvents() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Dashboard</p>
            <h1 className="text-3xl font-serif">Your Events</h1>
          </div>
          <Link
            href="/planner"
            className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors"
          >
            New Event
          </Link>
        </div>

        <div className="grid gap-4">
          {sampleEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#C6A14A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{event.name}</h3>
                  <p className="text-sm text-gray-300">{event.date}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">
                  {event.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
