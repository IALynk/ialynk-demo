"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 🔥 Connexion Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Halo suivant la souris
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // 🔥 Fonction login Supabase
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMsg("❌ Identifiants incorrects");
      return;
    }

    // ✔️ Connexion OK
    router.push("/dashboard");
  }

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#05070f] text-white">

      {/* ⭐ Bouton retour Accueil ⭐ */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M4 10v10h6v-6h4v6h6V10" />
        </svg>
        Accueil
      </Link>

      {/* Fond avec halos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-150px] left-[-200px] w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[700px] h-[700px] bg-purple-600/10 blur-[190px] rounded-full" />
        <div className="fixed inset-0 opacity-[0.04] mix-blend-soft-light bg-[url('/noise.png')] bg-repeat" />
      </div>

      {/* Halo qui suit la souris */}
      <div
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[200px]"
        style={{ top: mousePos.y - 300, left: mousePos.x - 300 }}
      />

      {/* Carte Login */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-[2px] rounded-3xl bg-gradient-to-r from-indigo-400 via-sky-500 to-purple-500 animate-borderGlow shadow-2xl"
      >
        <div className="w-full h-full p-10 rounded-3xl bg-white text-black shadow-xl">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/logo-ialynk.png" alt="IALynk Logo" width={130} height={130} />
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Connexion <span className="text-indigo-600">IALynk</span>
          </h2>

          {/* Message erreur */}
          {errorMsg && (
            <p className="text-red-600 text-center mb-4 font-medium">{errorMsg}</p>
          )}

          {/* Formulaire */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                placeholder="ex : contact@ialynk.com"
                className="mt-1 w-full rounded-xl bg-gray-100 border border-gray-300 p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl bg-gray-100 border border-gray-300 p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6674f3] hover:bg-[#5663d0] transition font-semibold text-white shadow-md disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes borderGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-borderGlow {
          background-size: 200% 200%;
          animation: borderGlow 8s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
