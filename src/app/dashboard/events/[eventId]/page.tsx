"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardEventDetail() {
  const { eventId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A0000] via-[#3A0000] to-[#4A0000] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Dashboard · Event</p>
            <h1 className="text-3xl font-serif">Event {eventId}</h1>
          </div>
          <Link
            href="/dashboard/events"
            className="text-sm text-[#C6A14A] hover:text-[#E8C56B]"
          >
            Back to events
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <p className="text-gray-300 text-sm">Placeholder detail view.</p>
          <ul className="text-sm text-gray-200 space-y-1">
            <li>Status: Planning</li>
            <li>Date: 2024-06-15</li>
            <li>Guests: 300</li>
            <li>Venue: Linked venue</li>
          </ul>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#C6A14A] text-black rounded-lg font-semibold hover:bg-[#E8C56B] transition-colors">
              Update status
            </button>
            <button className="px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10">
              Add task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
