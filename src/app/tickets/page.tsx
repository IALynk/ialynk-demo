"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import PageHeader from "@/components/PageHeader";
import TicketModal from "@/components/TicketModal"; // ⬅️ AJOUT IMPORTANT

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState("tous");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Modal ---
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [openTicketModal, setOpenTicketModal] = useState(false);

  const openModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setOpenTicketModal(true);
  };

  useEffect(() => {
    fetchTickets();
  }, [filter, search]);

  const fetchTickets = async () => {
    setLoading(true);

    let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });

    if (filter !== "tous") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) console.error("Erreur de récupération des tickets :", error);
    else {
      const filtered = data?.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      );
      setTickets(filtered || []);
    }

    setLoading(false);
  };

  return (
    <main className="p-8">
      {/* 🟦 En-tête global */}
      <PageHeader title="Tickets" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>

        <a
          href="/tickets/nouveau"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Ajouter un ticket
        </a>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un ticket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          {["tous", "en_cours", "programmé"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "tous"
                ? "Tous"
                : status === "en_cours"
                ? "En cours"
                : "Programmé"}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <p className="text-gray-400 italic">Chargement des tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-400 italic">Aucun ticket trouvé.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="border-b text-gray-500 text-sm">
              <tr>
                <th className="pb-2 text-left">Titre</th>
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-left">Statut</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => openModal(t)}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="py-2 font-medium text-blue-600">
                    {t.title}
                  </td>
                  <td className="py-2 text-gray-700 truncate max-w-xs">
                    {t.description || "—"}
                  </td>
                  <td className="py-2">
                    {t.status === "en_cours" ? "En cours" : "Programmé"}
                  </td>
                  <td className="py-2 text-right text-gray-400 text-sm">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      <TicketModal
        isOpen={openTicketModal}
        onClose={() => setOpenTicketModal(false)}
        ticket={selectedTicket}
      />
    </main>
  );
}
