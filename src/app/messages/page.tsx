"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, Filter } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MessageModal from "@/components/MessageModal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("recent");
  const [loading, setLoading] = useState(false);

  // 🟦 Nouveau : message sélectionné + modal
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);

    let query = supabase.from("messages").select("*");

    if (filter === "recent") query = query.order("created_at", { ascending: false });
    if (filter === "oldest") query = query.order("created_at", { ascending: true });
    if (filter === "unread") query = query.eq("is_read", false).order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) console.error(error);
    setMessages(data || []);
    setLoading(false);
  };

  // 🔍 Filtre local
  const filteredMessages = messages.filter((m) =>
    m.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🟦 NOUVEAU : ouvrir un message + marquer comme lu
  const openMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setOpenModal(true);

    // Marque le message comme lu dans Supabase
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", msg.id);

    // Mettre à jour l'état local
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
    );
  };

  return (
    <main className="p-8">
      {/* Header */}
      <PageHeader title="Messages" />

      {/* Titre section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Filter className="w-6 h-6 text-blue-600" />
          Messages
        </h1>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg pl-10 pr-4 py-2 text-sm w-64"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="recent">Les plus récents</option>
          <option value="oldest">Les plus anciens</option>
          <option value="unread">Non lus</option>
        </select>
      </div>

      {/* Tableau des messages */}
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <p className="text-gray-400 italic">Chargement...</p>
        ) : filteredMessages.length === 0 ? (
          <p className="text-gray-400 italic">Aucun message trouvé.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-2 text-left">Expéditeur</th>
                <th className="pb-2 text-left">Contenu</th>
                <th className="pb-2 text-left">Statut</th>
                <th className="pb-2 text-left">Heure</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => openMessage(m)}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="py-2">{m.sender}</td>
                  <td className="py-2 text-gray-700 truncate max-w-xs">{m.content}</td>
                  <td className="py-2">
                    {m.is_read ? (
                      <span className="text-green-600 font-medium">Lu</span>
                    ) : (
                      <span className="text-red-500 font-medium">Non lu</span>
                    )}
                  </td>
                  <td className="py-2 text-gray-400 text-sm">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🟦 MODAL AFFICHAGE MESSAGE */}
      <MessageModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        message={selectedMessage}
      />
    </main>
  );
}
