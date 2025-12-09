"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Building2, Mail, PenTool, Camera } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AgenceSettings() {
  const [name, setName] = useState("");
  const [siret, setSiret] = useState("");
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const uploadLogo = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const name = `agency-logo-${Date.now()}`;
    const { error } = await supabase.storage
      .from("agency")
      .upload(name, file);

    if (!error) {
      setLogoUrl(supabase.storage.from("agency").getPublicUrl(name).data.publicUrl);
    }
  };

  const save = async () => {
    await supabase.from("agency").update({
      name,
      siret,
      address,
      signature,
      logo_url: logoUrl,
    });

    alert("Agence mise à jour ✔️");
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold">Informations de l’agence</h2>

      {/* Logo */}
      <div className="flex items-center gap-6">
        <label className="cursor-pointer relative">
          <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden shadow hover:scale-105 transition">
            {logoUrl ? (
              <img src={logoUrl} className="w-full h-full object-contain" />
            ) : (
              <Camera className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <input type="file" className="hidden" onChange={uploadLogo} />
        </label>
      </div>

      <Field label="Nom de l'agence" icon={Building2} value={name} onChange={setName} />
      <Field label="SIRET" icon={PenTool} value={siret} onChange={setSiret} />
      <Field label="Adresse" icon={Building2} value={address} onChange={setAddress} />
      <Field label="Signature email" icon={Mail} value={signature} onChange={setSignature} textarea />

      <button className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow" onClick={save}>
        Enregistrer
      </button>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, textarea }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-start gap-2 bg-white border rounded-lg px-3 py-3 shadow-sm">
        <Icon className="w-5 h-5 text-gray-400 mt-1" />
        {textarea ? (
          <textarea
            className="flex-1 bg-transparent outline-none resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="flex-1 bg-transparent outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
