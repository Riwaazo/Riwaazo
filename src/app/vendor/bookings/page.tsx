"use client";

import Link from "next/link";

const sampleBookings = [
  { id: "VB-01", client: "Aarav & Siya", date: "2024-09-14", status: "Confirmed" },
  { id: "VB-02", client: "Corporate Gala", date: "2024-06-20", status: "Proposal Sent" },
];

export default function VendorBookings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Vendor</p>
            <h1 className="text-3xl font-serif">Bookings</h1>
          </div>
          <Link href="/vendor/dashboard" className="text-[#C6A14A] hover:text-[#E8C56B] text-sm">
            Back to dashboard
          </Link>
        </div>
        <div className="grid gap-4">
          {sampleBookings.map((booking) => (
            <div key={booking.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{booking.client}</h3>
                  <p className="text-sm text-gray-300">{booking.date}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
