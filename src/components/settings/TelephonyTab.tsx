"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function TelephonyTab() {
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    loadTelephony();
  }, []);

  const loadTelephony = async () => {
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

    // Charger les paramètres existants
    const { data } = await supabase
      .from("telephony_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setSettings(data);
      setProvider(data.provider || "");
      setApiKey(data.api_key || "");
      setSecret(data.secret || "");
      setPhoneNumber(data.phone_number || "");
      setStatus(data.status || "disconnected");
    }

    setLoading(false);
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);

    const payload = {
      provider,
      api_key: apiKey,
      secret,
      phone_number: phoneNumber,
      updated_at: new Date(),
    };

    if (settings) {
      await supabase
        .from("telephony_settings")
        .update(payload)
        .eq("id", settings.id);
    } else {
      await supabase.from("telephony_settings").insert({
        user_id: user.id,
        status: "disconnected",
        ...payload,
      });
    }

    alert("Paramètres téléphonie mis à jour ✔️");
    setSaving(false);
  };

  // Test de connexion fake pour la démo
  const testConnection = async () => {
    if (!apiKey || !secret) {
      alert("Impossible : API Key ou Secret manquant.");
      return;
    }

    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Simule une connexion réussie
    setStatus("connected");
    alert("Connexion réussie ✔️");

    // Mettre à jour le statut en base
    await supabase
      .from("telephony_settings")
      .update({ status: "connected" })
      .eq("user_id", user.id);

    setTesting(false);
  };

  if (loading)
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Chargement de la téléphonie…
      </p>
    );

  return (
    <div className="max-w-xl bg-white dark:bg-neutral-800 border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Téléphonie</h2>

      {/* STATUS */}
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`w-3 h-3 rounded-full ${
            status === "connected"
              ? "bg-green-500"
              : status === "disconnected"
              ? "bg-red-500"
              : "bg-yellow-500"
          }`}
        />
        <p className="font-medium">
          Statut :{" "}
          <span
            className={
              status === "connected"
                ? "text-green-600"
                : status === "disconnected"
                ? "text-red-600"
                : "text-yellow-600"
            }
          >
            {status}
          </span>
        </p>
      </div>

      {/* PROVIDER */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Provider</label>
        <select
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="">Choisir</option>
          <option value="telnyx">Telnyx</option>
          <option value="twilio">Twilio</option>
          <option value="custom">Custom SIP</option>
        </select>
      </div>

      {/* API KEY */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">API Key</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      {/* SECRET */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Secret</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
      </div>

      {/* PHONE NUMBER */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Numéro connecté</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+33..."
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>

        <button
          onClick={testConnection}
          disabled={testing}
          className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 rounded-lg hover:opacity-80 disabled:opacity-50"
        >
          {testing ? "Test…" : "Tester la connexion"}
        </button>
      </div>
    </div>
  );
}
