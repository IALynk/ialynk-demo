"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AIAssistantTab() {
  const [user, setUser] = useState<any>(null);
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [tone, setTone] = useState("pro");
  const [language, setLanguage] = useState("fr");
  const [voice, setVoice] = useState("default");
  const [expertMode, setExpertMode] = useState(false);
  const [bannedWords, setBannedWords] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    setUser(auth.user);

    const { data } = await supabase
      .from("assistant_preferences")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (data) {
      setPrefs(data);
      setTone(data.tone || "pro");
      setLanguage(data.language || "fr");
      setVoice(data.voice || "default");
      setExpertMode(data.expert_mode || false);
      setBannedWords(data.banned_words || "");
      setInstructions(data.custom_instructions || "");
    }

    setLoading(false);
  };

  const save = async () => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      tone,
      language,
      voice,
      expert_mode: expertMode,
      banned_words: bannedWords,
      custom_instructions: instructions,
    };

    // UPDATE ou INSERT sans variable intermédiaire (Solution TypeScript)
    if (prefs) {
      await supabase
        .from("assistant_preferences")
        .update(payload)
        .eq("id", prefs.id);
    } else {
      await supabase.from("assistant_preferences").insert(payload);
    }

    alert("Préférences IA mises à jour !");
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="bg-white dark:bg-neutral-800 border rounded-xl p-6 shadow-sm max-w-xl">
      <h2 className="text-xl font-semibold mb-6">Assistant IA</h2>

      <div className="mb-4">
        <label className="block mb-1">Ton de l’IA</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
        >
          <option value="pro">Professionnel</option>
          <option value="friendly">Amical</option>
          <option value="concise">Concis</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Langue</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
        >
          <option value="fr">Français</option>
          <option value="en">Anglais</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Voix</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span>Mode Expert</span>
        <input
          type="checkbox"
          checked={expertMode}
          onChange={(e) => setExpertMode(e.target.checked)}
          className="w-5 h-5 accent-blue-600"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Mots interdits</label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={bannedWords}
          onChange={(e) => setBannedWords(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1">Instructions personnalisées</label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition"
      >
        Enregistrer les préférences IA
      </button>
    </div>
  );
}
