"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AgencyTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null);

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1E40AF");
  const [secondaryColor, setSecondaryColor] = useState("#1E3A8A");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadAgency();
  }, []);

  const loadAgency = async () => {
    // Charger user auth
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    setUser(auth.user);

    // Charger l'agence associée
    const { data: agencyData } = await supabase
      .from("agencies")
      .select("*")
      .eq("admin_user_id", auth.user.id)
      .single();

    if (agencyData) {
      setAgency(agencyData);
      setName(agencyData.name || "");
      setContactEmail(agencyData.contact_email || "");
      setPrimaryColor(agencyData.primary_color || "#1E40AF");
      setSecondaryColor(agencyData.secondary_color || "#1E3A8A");
      setLogoUrl(agencyData.logo_url || null);
    }

    setLoading(false);
  };

  const uploadLogo = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file || !agency) return;

    const ext = file.name.split(".").pop();
    const path = `${agency.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("agency-logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert("Erreur upload logo : " + uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("agency-logos").getPublicUrl(path);

    setLogoUrl(publicUrl);
  };

  const saveAgency = async () => {
    if (!agency) return;
    setSaving(true);

    const { error } = await supabase
      .from("agencies")
      .update({
        name,
        contact_email: contactEmail,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        updated_at: new Date(),
      })
      .eq("id", agency.id);

    if (error) {
      alert("Erreur lors de la sauvegarde");
      console.error(error);
    } else {
      alert("Agence mise à jour !");
    }

    setSaving(false);
  };

  if (loading)
    return (
      <p className="text-gray-500 dark:text-gray-400">Chargement de l’agence…</p>
    );

  return (
    <div className="max-w-2xl bg-white dark:bg-neutral-800 border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Informations de l’agence</h2>

      {/* LOGO */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={
            logoUrl ||
            "https://ui-avatars.com/api/?name=Agency&background=1E40AF&color=fff"
          }
          className="w-20 h-20 rounded-lg object-cover border"
        />
        <div>
          <label className="block mb-1 text-sm font-medium">Logo agence</label>
          <input type="file" accept="image/*" onChange={uploadLogo} />
        </div>
      </div>

      {/* CHAMPS */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom de l’agence</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email de contact</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        {/* COULEURS */}
        <div className="flex items-center gap-6">
          <div>
            <label className="block mb-1 font-medium">Couleur primaire</label>
            <input
              type="color"
              className="w-12 h-10 rounded cursor-pointer"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Couleur secondaire</label>
            <input
              type="color"
              className="w-12 h-10 rounded cursor-pointer"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={saveAgency}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
