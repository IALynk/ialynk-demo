"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export default function RegisterPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // 🆕 Nouveau formulaire : Identifiants + Agence
  // -----------------------------------------------------
  const [form, setForm] = useState({
    username: "",
    loginEmail: "",
    password: "",
    confirmPassword: "",

    agency_name: "",
    siret: "",
    proEmail: "",
    phone: "",
    address: "",
    manager_firstname: "",
    manager_lastname: "",
  });

  const handleChange = (field: string, value: string) =>
    setForm({ ...form, [field]: value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    // -----------------------------------------------------
    // 1️⃣ Création de l’utilisateur (login)
    // -----------------------------------------------------
    const { data: authUser, error: authError } =
      await supabase.auth.signUp({
        email: form.loginEmail,
        password: form.password,
      });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authUser.user?.id;

    // -----------------------------------------------------
    // 2️⃣ Création de l’agence dans Supabase
    // -----------------------------------------------------
    const { error: insertError } = await supabase.from("agencies").insert([
      {
        id: userId,
        agency_name: form.agency_name,
        siret: form.siret || null,
        email: form.proEmail,
        phone: form.phone,
        address: form.address,
        manager_firstname: form.manager_firstname,
        manager_lastname: form.manager_lastname,
        username: form.username,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // -----------------------------------------------------
    // 3️⃣ Email automatique à toi (contact@ialynk.com)
    // -----------------------------------------------------
    await resend.emails.send({
      from: "IALynk <no-reply@ialynk.com>",
      to: "contact@ialynk.com",
      subject: "Nouvelle inscription • IALynk",
      html: `
        <h2>Nouvelle inscription utilisateur</h2>
        <p><strong>Nom d’utilisateur :</strong> ${form.username}</p>
        <p><strong>Email de connexion :</strong> ${form.loginEmail}</p>
        <br>
        <h3>Informations agence</h3>
        <p><strong>Agence :</strong> ${form.agency_name}</p>
        <p><strong>Email pro :</strong> ${form.proEmail}</p>
        <p><strong>SIRET :</strong> ${form.siret || "Non renseigné"}</p>
        <p><strong>Téléphone :</strong> ${form.phone}</p>
        <p><strong>Adresse :</strong> ${form.address}</p>
        <p><strong>Gérant :</strong> ${form.manager_firstname} ${form.manager_lastname}</p>
      `,
    });

    // -----------------------------------------------------
    // 4️⃣ Redirection
    // -----------------------------------------------------
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#060b1a] px-4">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl"
      >
        {/* ----------- TITRE ----------- */}
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
          Créer mon profil
        </h1>

        <p className="text-center text-slate-600 mb-6">
          Inscription à la plateforme IALynk
        </p>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* -----------------------------------------------------
             🔐 IDENTIFIANTS
          ------------------------------------------------------- */}
          <h2 className="text-lg font-semibold text-slate-800">Identifiants</h2>

          <input
            type="text"
            placeholder="Nom d'utilisateur *"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email de connexion *"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.loginEmail}
            onChange={(e) => handleChange("loginEmail", e.target.value)}
            required
          />

          <div className="flex gap-3">
            <input
              type="password"
              placeholder="Mot de passe *"
              className="w-1/2 p-3 rounded-lg border border-slate-300"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmer *"
              className="w-1/2 p-3 rounded-lg border border-slate-300"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
            />
          </div>

          {/* -----------------------------------------------------
             🏢 INFORMATIONS AGENCE
          ------------------------------------------------------- */}
          <h2 className="text-lg font-semibold text-slate-800 mt-4">
            Informations de l'agence
          </h2>

          <input
            type="text"
            placeholder="Nom de l’agence *"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.agency_name}
            onChange={(e) => handleChange("agency_name", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Numéro SIRET (optionnel)"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.siret}
            onChange={(e) => handleChange("siret", e.target.value)}
          />

          <input
            type="email"
            placeholder="Email professionnel *"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.proEmail}
            onChange={(e) => handleChange("proEmail", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Téléphone de l'agence *"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Adresse complète *"
            className="w-full p-3 rounded-lg border border-slate-300"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Prénom du gérant *"
              className="w-1/2 p-3 rounded-lg border border-slate-300"
              value={form.manager_firstname}
              onChange={(e) =>
                handleChange("manager_firstname", e.target.value)
              }
              required
            />
            <input
              type="text"
              placeholder="Nom du gérant *"
              className="w-1/2 p-3 rounded-lg border border-slate-300"
              value={form.manager_lastname}
              onChange={(e) =>
                handleChange("manager_lastname", e.target.value)
              }
              required
            />
          </div>

          {/* -----------------------------------------------------
             BOUTON
          ------------------------------------------------------- */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-lg font-semibold text-slate-900 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f5e39e)",
              boxShadow: "0 0 12px rgba(212,175,55,0.35)",
            }}
          >
            {loading ? "Création en cours..." : "Créer mon profil"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
