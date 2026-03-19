"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorServices() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/vendors?tab=storefront");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B14] via-[#1A0F1F] to-[#1F0C0C] text-white flex items-center justify-center">
      <p className="text-gray-400">Redirecting to vendor dashboard…</p>
    </div>
  );
}
