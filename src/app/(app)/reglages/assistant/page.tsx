"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bot, Edit3, Settings2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AssistantIASettings() {
  const [tone, setTone] = useState("neutre");
  const [instructions, setInstructions] = useState("");
  const [autoReply, setAutoReply] = useState(true);

  const save = async () => {
    await supabase.from("assistant_settings").update({
      tone,
      instructions,
      auto_reply: autoReply,
    });
    alert("Assistant IA mis à jour ✔️");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold">Assistant IA</h2>

      {/* Ton */}
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          <Settings2 className="w-5 h-5" /> Ton de réponse
        </label>
        <select
          className="mt-1 w-full border rounded-lg p-3 shadow-sm"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option value="neutre">Neutre</option>
          <option value="formel">Formel</option>
          <option value="chaleureux">Chaleureux</option>
          <option value="professionnel">Professionnel</option>
        </select>
      </div>

      {/* Instructions */}
      <Field
        label="Instructions système"
        icon={Bot}
        value={instructions}
        onChange={setInstructions}
        textarea
      />

      {/* Auto reply toggle */}
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={autoReply}
          onChange={() => setAutoReply(!autoReply)}
          className="w-5 h-5"
        />
        <span>Activer les réponses automatiques</span>
      </div>

      <button className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow" onClick={save}>
        Enregistrer
      </button>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, textarea }: any) {
  return (
    <div>
      <label className="text-sm font-medium flex items-center gap-2">
        <Icon className="w-5 h-5" /> {label}
      </label>
      {textarea ? (
        <textarea
          className="mt-1 w-full border rounded-lg p-3 shadow-sm resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      ) : (
        <input
          className="mt-1 w-full border rounded-lg p-3 shadow-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
