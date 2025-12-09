"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { STATUS_COLUMNS, Ticket, TicketStatus } from "@/lib/tickets";
import { TicketCard } from "@/components/tickets/TicketCard";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TicketsKanbanPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<Ticket | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);

    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    setTickets((data || []) as Ticket[]);
    setLoading(false);
  }

  function onDragStart(ticket: Ticket) {
    setDragging(ticket);
  }

  async function onDropColumn(status: TicketStatus) {
    if (!dragging) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === dragging.id ? { ...t, status, updated_at: new Date().toISOString() } : t
      )
    );

    setDragging(null);

    await supabase
      .from("tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", dragging.id);
  }

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.requester_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.property_address || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">

      {/* ---- HEADER PREMIUM + FLÈCHE ---- */}
      <div className="mb-6">
        {/* Flèche seule PREMIUM */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-500 hover:text-gray-800 transition mb-3"
        >
          <span className="text-2xl leading-none">←</span>
        </Link>

        {/* Titre & Sous-titre */}
        <div className="flex justify-between items-center mt-2">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Tickets
            </h1>
            <p className="text-sm text-gray-500">
              Suivi des demandes locataires, visites, travaux et incidents.
            </p>
          </div>

          {/* Bouton Nouveau Ticket */}
          <Link
            href="/tickets/new"
            className="
              px-4 py-2 rounded-lg shadow 
              bg-blue-600 text-white text-sm font-medium 
              hover:bg-blue-700 transition
            "
          >
            + Créer un ticket
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <TicketFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* ---- CONTENU ---- */}
      {loading ? (
        <p className="text-sm text-gray-500 mt-6">Chargement des tickets…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">

          {STATUS_COLUMNS.map((col) => (
            <div
              key={col.id}
              className={`
                rounded-2xl border p-4 min-h-[300px] flex flex-col bg-white shadow-sm 
                ${col.color}
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropColumn(col.id)}
            >
              {/* Titre colonne */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-sm font-semibold text-gray-800 tracking-tight">
                  {col.label}
                </h2>

                <span className="text-xs text-gray-500">
                  {filteredTickets.filter((t) => t.status === col.id).length}
                </span>
              </div>

              {/* Tickets */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                {filteredTickets
                  .filter((t) => t.status === col.id)
                  .map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      draggable
                      onDragStart={onDragStart}
                    />
                  ))}

                {/* Aucun ticket */}
                {filteredTickets.filter((t) => t.status === col.id).length === 0 && (
                  <p className="text-center text-[12px] text-gray-400 mt-4 italic">
                    Aucun ticket dans cette colonne.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
