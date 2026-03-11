"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Shield } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/admin/check", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        router.replace("/admin");
      }
    };
    check();
  }, [router, supabase]);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Use at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    const res = await fetch("/api/admin/check", { credentials: "include", cache: "no-store" });
    if (!res.ok) {
      setFormError("Not authorized as admin. Contact support if this is unexpected.");
      await supabase.auth.signOut();
      setIsSubmitting(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1A0F1F] to-[#240000] text-white">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 bg-white/95 text-gray-900 border border-white/20 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden backdrop-blur">
          <div className="hidden lg:flex flex-col justify-center gap-3 bg-gradient-to-br from-[#2A0A0A] via-[#1A0F1F] to-[#0B0B14] px-10 py-12 text-white">
            <div className="flex items-center gap-2 text-[#C6A14A]">
              <Shield size={18} />
              <p className="uppercase text-xs tracking-[0.25em]">Admin Access</p>
            </div>
            <h1 className="text-3xl font-serif leading-tight">Sign in as admin</h1>
            <p className="text-gray-200">Restricted access for platform administrators.</p>
          </div>

          <div className="px-8 py-10">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Admin login</h2>
              <p className="text-gray-600 text-sm mt-1">Use your admin credentials to continue.</p>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Admin email</label>
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}>
                  <Mail size={18} className="text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@riwaazo.com"
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
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In as Admin"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Not an admin? <Link className="text-[#C6A14A] font-semibold" href="/auth/login">Back to regular login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
