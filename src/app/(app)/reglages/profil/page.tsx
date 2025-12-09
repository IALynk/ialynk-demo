"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  User,
  Mail,
  Phone,
  Camera,
  Trash2,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilSettings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------------
  // Upload avatar
  const uploadAvatar = async (e: any) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const name = `avatar-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(name, file);

      if (error) throw error;

      const url = supabase.storage.from("avatars").getPublicUrl(name).data.publicUrl;
      setAvatarUrl(url);
    } finally {
      setLoading(false);
    }
  };

  // Delete avatar
  const deleteAvatar = () => {
    setAvatarUrl("");
  };

  // Save profile
  const saveProfile = async () => {
    await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      avatar_url: avatarUrl,
    });

    alert("Profil mis à jour ✔️");
  };

  return (
    <div className="max-w-2xl space-y-8">

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <label className="relative cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden shadow-lg hover:scale-105 transition">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-semibold">U</span>
            )}
          </div>
          <Camera className="absolute bottom-0 right-0 bg-black/60 text-white p-1 rounded-full w-7 h-7" />

          <input type="file" className="hidden" onChange={uploadAvatar} />
        </label>

        {avatarUrl && (
          <button
            onClick={deleteAvatar}
            className="flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-5 h-5" />
            Supprimer
          </button>
        )}
      </div>

      {/* Champs */}
      <div className="space-y-5">
        {/* Prénom */}
        <Field
          label="Prénom"
          icon={User}
          value={firstName}
          onChange={setFirstName}
        />

        {/* Nom */}
        <Field
          label="Nom"
          icon={User}
          value={lastName}
          onChange={setLastName}
        />

        {/* Email */}
        <Field
          label="Email"
          icon={Mail}
          value={email}
          onChange={setEmail}
        />

        {/* Téléphone */}
        <Field
          label="Téléphone"
          icon={Phone}
          value={phone}
          onChange={setPhone}
        />
      </div>

      <button
        onClick={saveProfile}
        className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Enregistrer les modifications
      </button>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center gap-2 bg-white dark:bg-neutral-900 border rounded-lg px-3 py-3 shadow-sm">
        <Icon className="w-5 h-5 text-gray-400" />
        <input
          className="flex-1 bg-transparent outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
