"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#081526] to-[#0B1F38]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6"
      >

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Bienvenue sur <span className="text-blue-400">IALynk</span>
        </h1>

        <p className="text-gray-300 mb-8 text-lg">
          Votre assistant immobilier intelligent, disponible 24h/24 et 7jrs/7.
        </p>

        <Link
          href="/login"
          className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-all duration-200"
        >
          Accéder au tableau de bord
        </Link>

      </motion.div>
    </main>
  );
}
