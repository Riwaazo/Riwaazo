"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/shared/Navbar";
import { Mail, Lock, User, Building2, Phone, MapPin, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignupContent() {
  const searchParams = useSearchParams();
  const allowedRoles = useMemo(() => ["user", "vendor", "venue-owner", "planner"] as const, []);
  const supabase = useMemo(() => createClient(), []);
  const vendorProfileId = searchParams.get("vendorProfileId") || undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "vendor" | "venue-owner" | "planner">("user");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [plannerFocus, setPlannerFocus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; company?: string; category?: string; city?: string; phone?: string; venueName?: string; capacity?: string; plannerFocus?: string }>({});

  useEffect(() => {
    const qpRole = searchParams.get("role");
    if (qpRole && allowedRoles.includes(qpRole as typeof allowedRoles[number])) {
      setRole(qpRole as typeof role);
    }
  }, [searchParams, allowedRoles]);

  const validate = () => {
    const nextErrors: { [key: string]: string | undefined } = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters";
    }

    if (role === "vendor") {
      if (!company.trim()) nextErrors.company = "Company is required";
      if (!category.trim()) nextErrors.category = "Category is required";
      if (!city.trim()) nextErrors.city = "City is required";
      if (!phone.trim()) nextErrors.phone = "Phone is required";
    }

    if (role === "venue-owner") {
      if (!venueName.trim()) nextErrors.venueName = "Venue name is required";
      if (!capacity.trim()) nextErrors.capacity = "Capacity is required";
      if (!city.trim()) nextErrors.city = "City is required";
      if (!phone.trim()) nextErrors.phone = "Phone is required";
    }

    if (role === "planner") {
      if (!plannerFocus.trim()) nextErrors.plannerFocus = "Focus area is required";
      if (!city.trim()) nextErrors.city = "City is required";
      if (!phone.trim()) nextErrors.phone = "Phone is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const metadata = {
      full_name: name.trim(),
      role,
      company: role === "vendor" ? company.trim() : undefined,
      category: role === "vendor" ? category.trim() : undefined,
      city: city.trim() || undefined,
      phone: phone.trim() || undefined,
      venueName: role === "venue-owner" ? venueName.trim() : undefined,
      capacity: role === "venue-owner" ? capacity.trim() : undefined,
      plannerFocus: role === "planner" ? plannerFocus.trim() : undefined,
      vendorProfileId: role === "vendor" ? vendorProfileId : undefined,
    };

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/post-login` : undefined,
      },
    });

    if (error) {
      setFormError(error.message);
    } else {
      // Ensure role metadata sticks even if Supabase returns a user session immediately
      if (data.user && !data.user.user_metadata?.role) {
        await supabase.auth.updateUser({ data: metadata });
      }
      setFormSuccess("Check your email to confirm your account, then sign in.");
      setName("");
      setEmail("");
      setPassword("");
      setCompany("");
      setCategory("");
      setCity("");
      setPhone("");
      setVenueName("");
      setCapacity("");
      setPlannerFocus("");
      setRole("user");
    }

    setIsSubmitting(false);
  };

  const handleGoogle = async () => {
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/post-login` : undefined,
      },
    });
    if (error) setFormError(error.message);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000] text-white">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white/95 text-gray-900 border border-white/20 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden backdrop-blur">
          <div className="hidden lg:flex flex-col justify-center gap-3 bg-gradient-to-br from-[#5A0000] via-[#4A0000] to-[#3A0000] px-10 py-12 text-white">
            <p className="uppercase text-xs tracking-[0.25em] text-[#C6A14A]">Riwaazo</p>
            <h1 className="text-3xl font-serif leading-tight">Create your account</h1>
            <p className="text-gray-200">Start saving venues, vendors, and planning your event.</p>
          </div>

          <div className="px-8 py-10">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Sign up</h2>
              <p className="text-gray-600 text-sm">Join the platform in a few seconds.</p>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Choose your role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "user", label: "User" },
                    { id: "vendor", label: "Vendor" },
                    { id: "venue-owner", label: "Venue Owner" },
                    { id: "planner", label: "Event Planner" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as typeof role)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${role === r.id ? "border-[#C6A14A] bg-[#C6A14A]/10 text-[#4A0000]" : "border-gray-300 bg-white text-gray-800 hover:border-[#C6A14A]"}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Full name</label>
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                  <User size={18} className="text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Sharma"
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Email</label>
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                  <Mail size={18} className="text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">Password</label>
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                  <Lock size={18} className="text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              {role === "vendor" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Company</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.company ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <Building2 size={18} className="text-gray-500" />
                      <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Studio Name"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Category</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.category ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <CheckSquare size={18} className="text-gray-500" />
                      <input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Catering, Decor, Photo..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">City</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.city ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <MapPin size={18} className="text-gray-500" />
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Phone</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <Phone size={18} className="text-gray-500" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              )}

              {role === "venue-owner" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Venue name</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.venueName ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <Building2 size={18} className="text-gray-500" />
                      <input
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="Royal Palace"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.venueName && <p className="text-sm text-red-500">{errors.venueName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Capacity</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.capacity ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <CheckSquare size={18} className="text-gray-500" />
                      <input
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="500-1000"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">City</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.city ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <MapPin size={18} className="text-gray-500" />
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Delhi"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Phone</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <Phone size={18} className="text-gray-500" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              )}

              {role === "planner" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Focus area</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.plannerFocus ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <CheckSquare size={18} className="text-gray-500" />
                      <input
                        value={plannerFocus}
                        onChange={(e) => setPlannerFocus(e.target.value)}
                        placeholder="Weddings, corporate, social..."
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.plannerFocus && <p className="text-sm text-red-500">{errors.plannerFocus}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">City</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.city ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <MapPin size={18} className="text-gray-500" />
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Delhi"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Phone</label>
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                      <Phone size={18} className="text-gray-500" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>

              <button
                type="button"
                onClick={handleGoogle}
                className="w-full border border-gray-300 text-gray-800 font-semibold py-3 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-60"
                disabled={isSubmitting}
              >
                Continue with Google
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account? <Link className="text-[#C6A14A] font-semibold" href="/auth/login">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#4A0000] via-[#3A0000] to-[#2a0000]" />}>
      <SignupContent />
    </Suspense>
  );
}
