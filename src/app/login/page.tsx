"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("RESULT:", data, error);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-neutral-900 px-4">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">Connexion IALynk</h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-700 dark:border-neutral-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ex : contact@ialynk.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-lg border dark:bg-neutral-700 dark:border-neutral-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 opacity-70">
          Mot de passe oublié ?
        </p>
      </div>
    </main>
  );
}
