"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import PageHeader from "@/components/PageHeader";

// 🔑 Connexion Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecherchePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("recent");
  const [loading, setLoading] = useState(false);

  // 🔄 Charger tous les messages
  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);
    let query = supabase.from("messages").select("*");

    // Tri selon le filtre choisi
    if (filter === "recent") query = query.order("created_at", { ascending: false });
    if (filter === "oldest") query = query.order("created_at", { ascending: true });

    const { data, error } = await query;
    if (error) console.error(error);
    setMessages(data || []);
    setLoading(false);
  };

  // 🔍 Filtrage local par contenu / rôle
  const filteredMessages = messages.filter(
    (m) =>
      m.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-8 bg-gray-50 min-h-screen text-gray-900">
      {/* 🟦 En-tête global avec flèche retour + barre de recherche */}
      <PageHeader title="Recherche" />

      <h1 className="text-2xl font-bold mb-6">Recherche de messages / contacts</h1>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un message, un contact..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="recent">Les plus récents</option>
          <option value="oldest">Les plus anciens</option>
          <option value="unread">Non lus</option>
        </select>
      </div>

      {/* Table de résultats */}
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <p className="text-gray-400 italic">Chargement...</p>
        ) : filteredMessages.length === 0 ? (
          <p className="text-gray-400 italic">Aucun message trouvé.</p>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-gray-500 text-sm">
                <th className="pb-2">Rôle</th>
                <th className="pb-2">Contenu</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((msg) => (
                <tr
                  key={msg.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-2 font-semibold text-gray-700">
                    {msg.role === "assistant" ? "🤖 IA" : "👤 Utilisateur"}
                  </td>
                  <td className="py-2 text-gray-600 truncate">{msg.content}</td>
                  <td className="py-2 text-gray-400 text-sm">
                    {new Date(msg.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
