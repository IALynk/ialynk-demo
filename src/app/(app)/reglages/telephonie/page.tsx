"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Phone, Clock, ArrowRightLeft, Mic } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TelephonieSettings() {
  const [number, setNumber] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [openingHours, setOpeningHours] = useState("09:00 - 19:00");
  const [voicemailText, setVoicemailText] = useState("");

  const save = async () => {
    await supabase.from("telephony").update({
      number,
      forward_to: forwardTo,
      hours: openingHours,
      voicemail: voicemailText,
    });
    alert("Paramètres téléphoniques mis à jour ✔️");
  };

  return (
    <div className="max-w-2xl space-y-8">

      <h2 className="text-xl font-semibold">Téléphonie</h2>

      <Field label="Numéro attribué" icon={Phone} value={number} onChange={setNumber} />

      <Field
        label="Renvoi d’appel vers"
        icon={ArrowRightLeft}
        value={forwardTo}
        onChange={setForwardTo}
      />

      <Field
        label="Horaires d'ouverture"
        icon={Clock}
        value={openingHours}
        onChange={setOpeningHours}
      />

      <Field
        label="Message de répondeur"
        icon={Mic}
        value={voicemailText}
        onChange={setVoicemailText}
        textarea
      />

      <button onClick={save} className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow">
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
