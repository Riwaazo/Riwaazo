"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("visited");
    if (visited === "true") {
      router.push("/");
      return;
    }

    const openTimer = setTimeout(() => setOpen(true), 1000);
    const navTimer = setTimeout(() => {
      localStorage.setItem("visited", "true");
      router.push("/");
    }, 4000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#5A0000] via-[#7A0000] to-[#3A0000] px-6">
      {/* Logo */}
      <motion.img
        src="/logo.png"
        alt="Riwaazo"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.9 }}
        transition={{ duration: 1.5 }}
        className="z-10 w-[220px] sm:w-[280px] lg:w-[320px]"
      />

      {/* Left Curtain */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: open ? "-100%" : 0 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-[#6A0000] to-[#4A0000] z-20"
      />

      {/* Right Curtain */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: open ? "100%" : 0 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
        className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#6A0000] to-[#4A0000] z-20"
      />
    </div>
  );
}
