"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/shared/Navbar";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const role = data.user.user_metadata?.role as string | undefined;
        router.replace(redirectForRole(role));
      }
    };

    checkSession();
  }, [router, supabase]);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const redirectForRole = (role?: string | null) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "vendor":
        return "/vendor/dashboard";
      case "venue-owner":
        return "/venue/dashboard";
      case "planner":
        return "/event-planner/dashboard";
      default:
        return "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    const role = data.user?.user_metadata?.role as string | undefined;
    router.replace(redirectForRole(role));
    router.refresh();
  };

  const handleGoogle = async () => {
    setFormError(null);
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
            <h1 className="text-3xl font-serif leading-tight">Welcome back</h1>
            <p className="text-gray-200">Access your dashboard, favorites, and bookings.</p>
          </div>

          <div className="px-8 py-10">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
              <p className="text-gray-600 text-sm mt-1">Use your email and password to continue.</p>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                {isSubmitting ? "Signing in..." : "Sign In"}
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
              Don&apos;t have an account? <Link className="text-[#C6A14A] font-semibold" href="/auth/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
