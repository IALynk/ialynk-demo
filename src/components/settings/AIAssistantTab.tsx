"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AIAssistantTab() {
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [prefs, setPrefs] = useState<any>(null);

  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("");
  const [voice, setVoice] = useState("");
  const [expertMode, setExpertMode] = useState(false);
  const [bannedWords, setBannedWords] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    // 🔥 Récupération correcte de l'utilisateur
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("❌ Aucun utilisateur connecté");
      setLoading(false);
      return;
    }

    setUser(user);

    const { data } = await supabase
      .from("assistant_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setPrefs(data);
      setTone(data.tone || "");
      setLanguage(data.language || "");
      setVoice(data.voice || "");
      setExpertMode(data.expert_mode || false);
      setBannedWords(data.banned_words || "");
      setCustomInstructions(data.custom_instructions || "");
    }

    setLoading(false);
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true);

    const updatePayload = {
      tone,
      language,
      voice,
      expert_mode: expertMode,
      banned_words: bannedWords,
      custom_instructions: customInstructions,
      updated_at: new Date(),
    };

    if (prefs) {
      // UPDATE
      await supabase
        .from("assistant_preferences")
        .update(updatePayload)
        .eq("id", prefs.id);
    } else {
      // INSERT
      await supabase.from("assistant_preferences").insert({
        user_id: user.id,
        ...updatePayload,
      });
    }

    alert("Assistant mis à jour !");
    setSaving(false);
  };

  if (loading)
    return <p className="text-gray-500 dark:text-gray-400">Chargement…</p>;

  return (
    <div className="max-w-2xl bg-white dark:bg-neutral-800 border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Assistant IA</h2>

      <div className="space-y-6">
        {/* TON */}
        <div>
          <label className="block mb-1 font-medium">Ton général</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="">Sélectionner un ton</option>
            <option value="professionnel">Professionnel</option>
            <option value="chaleureux">Chaleureux</option>
            <option value="direct">Direct</option>
            <option value="amical">Amical</option>
            <option value="expert">Expert</option>
            <option value="neutre">Neutre</option>
          </select>
        </div>

        {/* LANGUE */}
        <div>
          <label className="block mb-1 font-medium">Langue</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Choisir une langue</option>
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
            <option value="auto">Automatique</option>
          </select>
        </div>

        {/* VOIX */}
        <div>
          <label className="block mb-1 font-medium">Voix (pour appels)</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
          >
            <option value="">Choisir une voix</option>
            <option value="female_soft">Féminine — Douce</option>
            <option value="female_pro">Féminine — Professionnelle</option>
            <option value="male_calm">Masculine — Calme</option>
            <option value="male_dynamic">Masculine — Dynamique</option>
          </select>
        </div>

        {/* MODE EXPERT */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={expertMode}
            onChange={(e) => setExpertMode(e.target.checked)}
            className="w-5 h-5"
          />
          <label className="font-medium">Activer le mode expert</label>
        </div>

        {/* MOTS INTERDITS */}
        <div>
          <label className="block mb-1 font-medium">Mots interdits</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg h-20 dark:bg-neutral-700"
            value={bannedWords}
            onChange={(e) => setBannedWords(e.target.value)}
            placeholder="Ex : remboursement, conflit, menace..."
          />
        </div>

        {/* CUSTOM INSTRUCTIONS */}
        <div>
          <label className="block mb-1 font-medium">
            Instructions IA personnalisées
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg h-40 dark:bg-neutral-700"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Décris ici les directives à suivre pour ton assistant IA..."
          />
        </div>

        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
