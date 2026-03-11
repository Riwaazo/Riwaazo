"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{
    picture?: string | null;
    email?: string | null;
    role?: string | null;
    name?: string | null;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardForRole = (role?: string | null) => {
    const r = (role || "").toLowerCase();
    switch (r) {
      case "vendor":
        return "/vendor/dashboard";
      case "venue-owner":
        return "/venue/dashboard";
      case "planner":
        return "/event-planner/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/dashboard";
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Fetch from server to ensure cookies are honored even if client state lags
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          const u = json.user;
          const role = (u?.role || "")?.toLowerCase();
          setUser(u ? { email: u.email, role, name: u.name ?? u.email, picture: u.picture } : null);
        } else {
          const { data } = await supabase.auth.getSession();
          const u = data.session?.user;
          const role = (u?.user_metadata?.role || "")?.toLowerCase();
          setUser(u ? { email: u.email, role, name: u.user_metadata?.full_name } : null);
        }
      } catch (_err) {
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user;
        const role = (u?.user_metadata?.role || "")?.toLowerCase();
        if (active) setUser(u ? { email: u.email, role, name: u.user_metadata?.full_name } : null);
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const u = session?.user;
      const role = (u?.user_metadata?.role || "")?.toLowerCase();
      setUser(u ? { email: u.email, role, name: u.user_metadata?.full_name || u.user_metadata?.name || u.email } : null);
      setLoadingUser(false);
      router.refresh();
    });

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-[#0B0B14]/75 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Riwaazo Logo"
            width={42}
            height={42}
            className="rounded-full"
          />
          <span className="text-[#C6A14A] text-2xl font-serif">Riwaazo</span>
        </Link>

        {/* Center Links - Desktop */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <Link href="/" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
            Home
          </Link>
          <Link href="/vendors" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
            Vendors
          </Link>
          <Link href="/venues" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
            Venues
          </Link>
          <Link href="/event-planners" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
            Event Planners
          </Link>
          <Link href="/planner" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
            Planner
          </Link>
          <Link href="/budget" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
            Budget
          </Link>
        </div>

        {/* Right Links */}
        <div className="hidden sm:flex items-center gap-3">
          {loadingUser && <div className="w-9 h-9 rounded-full border border-white/20 animate-pulse" aria-label="Loading" />}
          {!loadingUser && !user && (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-[#C6A14A] transition-colors">
                Login
              </Link>
              <Link href="/auth/signup" className="text-[#C6A14A] border border-[#C6A14A] px-3 py-1 rounded-lg hover:bg-[#C6A14A] hover:text-black transition-colors shadow-[0_0_12px_rgba(198,161,74,0.35)]">
                Sign up
              </Link>
            </>
          )}
          {!loadingUser && user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-2 py-1 hover:border-[#C6A14A] transition-colors"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name || user.email || "Profile"}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C6A14A] text-[#0B0B14] font-semibold">
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="text-left leading-tight hidden md:block">
                  <p className="text-sm text-white/90">{user.name || user.email}</p>
                  <p className="text-xs text-gray-300 capitalize">{user.role || "user"}</p>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0B14] border border-white/10 shadow-xl p-2">
                  <Link
                    href={dashboardForRole(user.role)}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-100 hover:bg-white/10"
                    onClick={() => setProfileOpen(false)}
                  >
                    Go to dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-200 hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="sm:hidden text-gray-200 hover:text-[#C6A14A] transition-colors"
        >
          <span className="block w-6 h-0.5 bg-current rounded" />
          <span className="block w-6 h-0.5 bg-current rounded mt-1.5" />
          <span className="block w-6 h-0.5 bg-current rounded mt-1.5" />
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden mt-4 space-y-3 border-t border-white/10 pt-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/vendors" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
              Vendors
            </Link>
            <Link href="/venues" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
              Venues
            </Link>
            <Link href="/event-planners" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
              Event Planners
            </Link>
            <Link href="/planner" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
              Planner
            </Link>
            <Link href="/budget" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
              Budget
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {!loadingUser && !user && (
              <>
                <Link href="/auth/login" className="text-gray-200 hover:text-[#C6A14A] transition-colors" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link href="/auth/signup" className="text-[#0B0B14] bg-[#C6A14A] px-3 py-2 rounded-lg text-center font-medium shadow-[0_0_12px_rgba(198,161,74,0.35)]" onClick={() => setIsOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
            {!loadingUser && user && (
              <>
                <Link
                  href={dashboardForRole(user.role)}
                  className="text-gray-200 hover:text-[#C6A14A] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="text-left text-red-200 hover:text-red-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
