"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SecurityTab() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [logoutAll, setLogoutAll] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    setUser(auth.user);

    // Charger sessions
    const { data: sessionData } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    setSessions(sessionData || []);
    setLoading(false);
  };

  const updatePassword = async () => {
    if (!newPassword.trim()) {
      alert("Entrez un mot de passe valide.");
      return;
    }

    setSavingPass(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Mot de passe mis à jour ✔️");
      setNewPassword("");
    }

    setSavingPass(false);
  };

  const disconnectAllDevices = async () => {
    setLogoutAll(true);

    await supabase.auth.signOut();

    alert("Vous avez été déconnecté de tous les appareils.");
    setLogoutAll(false);
  };

  if (loading)
    return <p className="text-gray-500 dark:text-gray-400">Chargement…</p>;

  return (
    <div className="max-w-2xl bg-white dark:bg-neutral-800 border rounded-xl p-6 shadow-sm space-y-10">
      <h2 className="text-xl font-semibold">Sécurité du compte</h2>

      {/* --- Mot de passe --- */}
      <div>
        <h3 className="text-lg font-medium mb-2">Changer le mot de passe</h3>
        <div className="space-y-3">
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            onClick={updatePassword}
            disabled={savingPass}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {savingPass ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </div>
      </div>

      {/* --- Deconnexion globale --- */}
      <div>
        <h3 className="text-lg font-medium mb-2">Déconnexion globale</h3>
        <button
          onClick={disconnectAllDevices}
          disabled={logoutAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {logoutAll ? "Déconnexion…" : "Déconnecter tous les appareils"}
        </button>
      </div>

      {/* --- Historique des sessions --- */}
      <div>
        <h3 className="text-lg font-medium mb-4">Sessions actives & historiques</h3>

        {sessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Aucune session enregistrée.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="border rounded-lg p-3 dark:border-neutral-700"
              >
                <p className="text-sm">
                  <span className="font-medium">Date :</span>{" "}
                  {new Date(s.created_at).toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">IP :</span> {s.ip || "?"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Device :</span>{" "}
                  {s.device || "?"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status :</span>{" "}
                  {s.status || "?"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- 2FA --- */}
      <div>
        <h3 className="text-lg font-medium mb-2">Authentification à deux facteurs</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-3">
          Cette fonctionnalité sera bientôt disponible pour renforcer votre sécurité.
        </p>

        <button
          disabled
          className="px-4 py-2 bg-gray-300 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
        >
          Bientôt disponible
        </button>
      </div>
    </div>
  );
}
