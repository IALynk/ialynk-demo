"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut", delay: 0.9 }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute w-60 h-60 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, rgba(180,70,255,0.55), rgba(0,153,255,0.35), transparent)",
        }}
        initial={{ scale: 0.6, opacity: 0.2 }}
        animate={{ scale: 1.1, opacity: 0.45 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Logo */}
      <motion.img
        src="/logo-ialynk.png"
        alt="IALynk"
        className="w-44 relative z-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </motion.div>
  );
}
