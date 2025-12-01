"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProfileTab() {
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userAuth, setUserAuth] = useState<any>(null);
  const [userDB, setUserDB] = useState<any>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    // 🔥 Récupération correcte de la session côté client
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Aucun utilisateur connecté");
      setLoading(false);
      return;
    }

    setUserAuth(user);

    // Charger dans ta table Users
    const { data: dbUser } = await supabase
      .from("Users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbUser) {
      setUserDB(dbUser);
      setFullName(dbUser.full_name || "");
      setPhone(dbUser.phone || "");
      setAvatarUrl(dbUser.avatar_url || null);
    }

    setLoading(false);
  };

  const updateProfile = async () => {
    if (!userAuth) return;
    setSaving(true);

    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      },
    });

    const { error } = await supabase
      .from("Users")
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      })
      .eq("id", userAuth.id);

    if (error) {
      alert("Erreur lors de la mise à jour.");
      console.error(error);
    } else {
      alert("Profil mis à jour !");
    }

    setSaving(false);
  };

  const uploadAvatar = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file || !userAuth) return;

    const ext = file.name.split(".").pop();
    const path = `${userAuth.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert("Erreur upload avatar : " + uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    setAvatarUrl(publicUrl);
  };

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">Chargement du profil...</p>
    );
  }

  return (
    <div className="max-w-xl p-6 bg-white dark:bg-neutral-800 border rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Profil utilisateur</h2>

      {/* AVATAR */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={
            avatarUrl ||
            "https://ui-avatars.com/api/?name=User&background=1E40AF&color=fff"
          }
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <label className="block text-sm mb-1 font-medium">
            Mettre à jour l’avatar
          </label>
          <input type="file" accept="image/*" onChange={uploadAvatar} />
        </div>
      </div>

      {/* CHAMPS */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom complet</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Téléphone</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          onClick={updateProfile}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
