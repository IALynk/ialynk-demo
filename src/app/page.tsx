"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Page() {
  return (
    <main className="relative flex items-center justify-center h-screen w-full overflow-hidden bg-[#060b1a]">

      {/* BACKGROUND — BLEU NUIT NET */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071022] via-[#060b1a] to-[#020611]" />

      {/* SILHOUETTE DE BUILDINGS */}
      <div
        className="absolute bottom-0 left-0 w-full h-[280px] bg-repeat-x opacity-30"
        style={{
          backgroundImage: "url('/buildings.png')",
          backgroundSize: "contain",
          backgroundPosition: "bottom",
        }}
      />

      {/* HALO LUMINEUX DERRIÈRE LES BUILDINGS */}
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-600/20 blur-[120px] rounded-full opacity-60" />

      {/* TEXTE CENTRAL */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 text-center px-6"
      >
        {/* TITRE */}
        <h1 className="text-[42px] font-bold mb-4 text-white">
          Bienvenue sur <span className="text-white">IALynk</span>
        </h1>

        {/* PHRASE DORÉE */}
        <p
          className="text-xl mb-3"
          style={{
            color: "rgba(221, 190, 120, 1)",
            textShadow: "0 0 8px rgba(221,190,120,0.25)",
          }}
        >
          CRM intelligents pour les professionnels de l’immobilier
        </p>

        {/* SOUS-TEXTE */}
        <p className="text-lg mb-8 text-slate-300">
          Votre assistant immobilier intelligent, disponible 24h/24 et 7j/7.
        </p>

        {/* BOUTONS */}
        <div className="flex items-center justify-center gap-4">
          {/* SE CONNECTER */}
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-full text-lg font-semibold 
                         shadow-lg bg-slate-200 text-slate-900 hover:bg-white"
            >
              Se connecter
            </motion.button>
          </Link>

          {/* S’INSCRIRE — DORÉ */}
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-full text-lg font-semibold shadow-lg"
              style={{
                background: "linear-gradient(135deg, #d4af37, #f5e39e)",
                color: "#1b1b1b",
                boxShadow: "0 0 12px rgba(212,175,55,0.35)",
              }}
            >
              S’inscrire
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
