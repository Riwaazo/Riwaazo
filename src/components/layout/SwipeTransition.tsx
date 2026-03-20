"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Image from "next/image";

export default function SwipeTransition({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{ duration: 1.0, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full h-full bg-gradient-to-r from-[#FFD700] to-[#8B6914] z-50 pointer-events-none flex items-center justify-center"
      >
        {/* Logo & Brand in transition */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="Riwaazo Logo"
            width={60}
            height={60}
            className="rounded-full"
            priority
          />
          <h1 className="text-[#4A0000] text-4xl font-serif font-bold">Riwaazo</h1>
        </div>
      </motion.div>
      {children}
    </>
  );
}
