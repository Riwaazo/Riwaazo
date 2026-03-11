"use client";

import Link from "next/link";

const services = [
  { id: "S-01", name: "Wedding photography", price: "₹80,000", status: "Active" },
  { id: "S-02", name: "Cinematic video", price: "₹1,20,000", status: "Draft" },
];

export default function VendorServices() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Vendor</p>
            <h1 className="text-3xl font-serif">Services</h1>
          </div>
          <Link href="/vendor/dashboard" className="text-[#C6A14A] hover:text-[#E8C56B] text-sm">
            Back to dashboard
          </Link>
        </div>
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-[#C6A14A]/15 text-[#C6A14A] border border-[#C6A14A]/30">
                  {service.status}
                </span>
              </div>
              <p className="text-sm text-gray-300">Starting {service.price}</p>
              <div className="flex gap-2 mt-3 text-xs">
                <button className="px-3 py-2 bg-[#C6A14A]/15 text-[#C6A14A] rounded-lg border border-[#C6A14A]/30">Edit</button>
                <button className="px-3 py-2 bg-white/10 text-white rounded-lg border border-white/15">Preview</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
