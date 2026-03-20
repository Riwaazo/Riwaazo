"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Save, Sparkles, Trash } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/client";

const palette = {
  gold: "#C6A14A",
  goldLight: "#F4D58D",
  red: "#8B1E3F",
};

type Showcase = { id: string; title: string; location: string; summary: string; gallery: string[] };

export default function EditPlannerPortfolioPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [plannerName, setPlannerName] = useState("Planner");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | null>>({});

  const [services, setServices] = useState<string[]>(["Full planning", "Design & decor"]);
  const [regions, setRegions] = useState<string[]>(["Jaipur", "Goa"]);
  const [showcases, setShowcases] = useState<Showcase[]>([
    { id: "1", title: "Royal Sangeet Gala", location: "Jaipur", summary: "300 guests, heritage palace", gallery: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"] },
  ]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const role = (data.user?.user_metadata?.role as string | undefined)?.toUpperCase();
      const isPlanner = role === "PLANNER" || role === "EVENT_PLANNER";
      if (!data.user || !isPlanner) {
        setAuthError("Only event planners can edit this portfolio");
        return;
      }
      const name = (data.user.user_metadata?.full_name as string | undefined) || data.user.email || "Planner";
      setPlannerName(name);
      setAuthChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const addService = () => setServices((prev) => [...prev, "New service"]);
  const addRegion = () => setRegions((prev) => [...prev, "New region"]);
  const addShowcase = () =>
    setShowcases((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "New project", location: "", summary: "", gallery: [] },
    ]);

  const updateShowcase = (id: string, field: keyof Showcase, value: string) => {
    setShowcases((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeShowcase = (id: string) => setShowcases((prev) => prev.filter((item) => item.id !== id));

  const addGalleryImage = (id: string) => {
    setShowcases((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, gallery: [...item.gallery, "https://images.unsplash.com/..."] } : item
      )
    );
  };

  const updateGalleryImage = (id: string, idx: number, value: string) => {
    setShowcases((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const gallery = [...item.gallery];
        gallery[idx] = value;
        return { ...item, gallery };
      })
    );
  };

  const removeGalleryImage = (id: string, idx: number) => {
    setShowcases((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const gallery = [...item.gallery];
        gallery.splice(idx, 1);
        return { ...item, gallery };
      })
    );
  };

  const uploadGalleryImage = async (id: string, file: File) => {
    setUploadErrors((prev) => ({ ...prev, [id]: null }));
    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const path = `showcases/${id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("portfolio").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(path);
      setShowcases((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, gallery: [...item.gallery, publicUrl] } : item
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadErrors((prev) => ({ ...prev, [id]: message }));
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: POST to a real portfolio API when available
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/event-planner/portfolio");
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 py-12 flex items-center justify-center">
        {authError || "Loading editor…"}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B14] text-gray-100 px-6 pb-12 pt-28 relative overflow-hidden">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${palette.red}26` }} />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${palette.gold}1f` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#111827_1px,transparent_0)] [background-size:24px_24px] opacity-15" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Link href="/event-planner/portfolio" className="flex items-center gap-1 text-gray-300 hover:text-[#C6A14A]">
            <ArrowLeft size={14} /> Back to portfolio
          </Link>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: palette.goldLight }}>
              <Sparkles size={14} /> Edit portfolio
            </div>
            <p className="text-2xl font-semibold text-white mt-1">{plannerName}&apos;s details</p>
            <p className="text-sm text-gray-400">Update showcases, services, and regions you serve.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{ border: `1px solid ${palette.gold}`, backgroundColor: `${palette.gold}26`, color: palette.goldLight }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save changes
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Services</h3>
            <button
              onClick={addService}
              className="text-sm rounded-md px-2 py-1"
              style={{ border: `1px solid ${palette.red}`, backgroundColor: `${palette.red}1f`, color: palette.goldLight }}
            >
              <Plus size={14} /> Add service
            </button>
          </div>
          <div className="space-y-2">
            {services.map((svc, idx) => (
              <div key={`${svc}-${idx}`} className="flex items-center gap-2">
                <input
                  value={svc}
                  onChange={(e) => setServices((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                  className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A14A]"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Regions</h3>
            <button
              onClick={addRegion}
              className="text-sm rounded-md px-2 py-1"
              style={{ border: `1px solid ${palette.red}`, backgroundColor: `${palette.red}1f`, color: palette.goldLight }}
            >
              <Plus size={14} /> Add region
            </button>
          </div>
          <div className="space-y-2">
            {regions.map((reg, idx) => (
              <div key={`${reg}-${idx}`} className="flex items-center gap-2">
                <input
                  value={reg}
                  onChange={(e) => setRegions((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                  className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A14A]"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Showcases</h3>
            <button
              onClick={addShowcase}
              className="text-sm rounded-md px-2 py-1"
              style={{ border: `1px solid ${palette.red}`, backgroundColor: `${palette.red}1f`, color: palette.goldLight }}
            >
              <Plus size={14} /> Add showcase
            </button>
          </div>
          <div className="space-y-3">
            {showcases.map((sc) => (
              <div key={sc.id} className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    value={sc.title}
                    onChange={(e) => updateShowcase(sc.id, "title", e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A14A]"
                  />
                  <button
                    onClick={() => removeShowcase(sc.id)}
                    className="ml-2 text-red-200 hover:text-red-100"
                    aria-label="Remove showcase"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <input
                  value={sc.location}
                  onChange={(e) => updateShowcase(sc.id, "location", e.target.value)}
                  placeholder="Location"
                  className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A14A]"
                />
                <textarea
                  value={sc.summary}
                  onChange={(e) => updateShowcase(sc.id, "summary", e.target.value)}
                  placeholder="Summary"
                  className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A14A]"
                  rows={3}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Gallery</p>
                    <button
                      onClick={() => addGalleryImage(sc.id)}
                      className="text-xs rounded-md px-2 py-1"
                      style={{ border: `1px solid ${palette.red}`, backgroundColor: `${palette.red}1f`, color: palette.goldLight }}
                    >
                      <Plus size={12} /> Add image URL
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Upload image</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading[sc.id]}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadGalleryImage(sc.id, file);
                        e.target.value = "";
                      }}
                      className="text-sm text-gray-200"
                    />
                    {uploading[sc.id] && <p className="text-xs text-gray-400">Uploading…</p>}
                    {uploadErrors[sc.id] && <p className="text-xs text-red-200">{uploadErrors[sc.id]}</p>}
                  </div>
                  {sc.gallery.length === 0 && <p className="text-xs text-gray-500">No images yet.</p>}
                  {sc.gallery.map((url, idx) => (
                    <div key={`${sc.id}-img-${idx}`} className="flex items-center gap-2">
                      <input
                        value={url}
                        onChange={(e) => updateGalleryImage(sc.id, idx, e.target.value)}
                        placeholder="https://…"
                        className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A14A]"
                      />
                      <button
                        onClick={() => removeGalleryImage(sc.id, idx)}
                        className="text-red-200 hover:text-red-100"
                        aria-label="Remove image"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
