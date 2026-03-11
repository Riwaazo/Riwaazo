export default function EventPlannerDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C6A14A]">Event Planner</p>
          <h1 className="text-3xl font-semibold">Planner Dashboard</h1>
          <p className="text-gray-400">Overview of assigned events, timelines, and vendor coordination.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {["Active Events", "Upcoming This Month", "Vendors Coordinated"].map((label, idx) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-3xl font-semibold text-[#C6A14A]">{[4, 2, 6][idx]}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <span className="text-sm text-gray-400">Sample data</span>
          </div>
          <div className="divide-y divide-white/10">
            {[{
              title: "Mehndi Night",
              date: "Dec 15, 2025",
              venue: "Aurora Banquets",
              status: "Published",
            }, {
              title: "Corporate Gala",
              date: "Jan 10, 2026",
              venue: "City Grand Hall",
              status: "Draft",
            }].map((item) => (
              <div key={item.title} className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-2">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.venue}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <span>{item.date}</span>
                  <span className="rounded-full border border-[#C6A14A]/50 px-3 py-1 text-[#C6A14A] bg-[#C6A14A]/10">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold mb-3">Coordination Checklist</h2>
          <ul className="space-y-2 text-sm text-gray-200">
            <li>• Vendor confirmations (catering, decor, lighting)</li>
            <li>• Timeline & run-of-show approvals</li>
            <li>• Floorplan and guest flow review</li>
            <li>• Budget tracking and payments</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
