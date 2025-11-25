"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NouveauTicket() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("en_cours");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("tickets").insert([
      {
        title,
        description,
        status,
        created_at: new Date().toISOString(),
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("❌ Erreur lors de la création du ticket.");
    } else {
      setMessage("✅ Ticket créé avec succès !");
      setTimeout(() => router.push("/tickets"), 1500);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎫 Nouveau Ticket</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 flex flex-col gap-4"
      >
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Titre du ticket
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex : Problème de connexion"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Décris le problème ou la tâche à réaliser..."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en_cours">🟢 En cours</option>
            <option value="programmé">🕓 Programmé</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Création..." : "Créer le ticket"}
        </button>

        {message && (
          <p
            className={`text-center mt-2 ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
