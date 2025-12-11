"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Page() {
  return (
    <main className="relative flex items-center justify-center h-screen w-full overflow-hidden bg-[#060b1a]">

      {/* BACKGROUND — BLEU NUIT NET */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071022] via-[#060b1a] to-[#020611]" />

      {/* HALO LUMINEUX EN BAS — REMPLACE LES BUILDINGS */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-600/30 blur-[140px] rounded-full opacity-70" />

      {/* LIGNE LUMINEUSE AU SOL */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-400/30 shadow-[0_0_20px_5px_rgba(59,130,246,0.35)]" />

      {/* EFFET DE LUMIÈRES EN COLONNES */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-[20%] w-[6px] h-[180px] bg-blue-500/20 blur-[3px] rounded-full" />
        <div className="absolute bottom-0 left-[40%] w-[4px] h-[220px] bg-purple-500/20 blur-[4px] rounded-full" />
        <div className="absolute bottom-0 left-[60%] w-[8px] h-[160px] bg-indigo-500/20 blur-[3px] rounded-full" />
        <div className="absolute bottom-0 left-[80%] w-[5px] h-[200px] bg-blue-400/15 blur-[4px] rounded-full" />
      </div>

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
