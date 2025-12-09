"use client";

import Link from "next/link";
import { Ticket, statusBadgeColor, priorityBadgeColor } from "@/lib/tickets";

type Props = {
  ticket: Ticket;
  draggable?: boolean;
  onDragStart?: (ticket: Ticket) => void;
};

export function TicketCard({ ticket, draggable, onDragStart }: Props) {
  return (
    <div
      draggable={draggable}
      onDragStart={() => onDragStart?.(ticket)}
      className="
        bg-white rounded-xl border p-4 mb-3
        shadow-sm hover:shadow-md transition cursor-pointer
        hover:-translate-y-[1px]
      "
    >
      <Link href={`/tickets/${ticket.id}`} className="block">
        {/* HEADER : Titre + badge priorité */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">
            {ticket.title}
          </h3>

          <span
            className={
              "text-[10px] px-2 py-[2px] rounded-full font-medium whitespace-nowrap " +
              priorityBadgeColor(ticket.priority)
            }
          >
            {ticket.priority === "critique"
              ? "Critique"
              : ticket.priority === "elevee"
              ? "Élevée"
              : "Normal"}
          </span>
        </div>

        {/* Catégorie */}
        {ticket.category && (
          <p className="text-[11px] text-gray-500 mb-1 italic">
            {ticket.category}
          </p>
        )}

        {/* Adresse */}
        {ticket.property_address && (
          <p className="text-[11px] text-gray-600 mb-1">
            📍 {ticket.property_address}
          </p>
        )}

        {/* FOOTER : statut + locataire */}
        <div className="flex justify-between items-center mt-3">
          {/* Statut badge */}
          <span
            className={
              "text-[10px] px-2 py-[2px] rounded-full font-medium whitespace-nowrap " +
              statusBadgeColor(ticket.status)
            }
          >
            {ticket.status}
          </span>

          {/* Nom du demandeur */}
          <span className="text-[11px] text-gray-400 truncate max-w-[120px] text-right">
            👤 {ticket.requester_name || "Locataire / prospect"}
          </span>
        </div>
      </Link>
    </div>
  );
}
