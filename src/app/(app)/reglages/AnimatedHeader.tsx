"use client";

import { motion } from "framer-motion";

export function AnimatedHeader({ title, color }: { title: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div
        className="h-2 rounded-full mb-3"
        style={{
          background: color,
          boxShadow: `0 0 20px ${color}80`,
        }}
      ></div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-semibold tracking-tight"
        style={{ color }}
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}
