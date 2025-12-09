// src/lib/tickets.ts

/* -----------------------------
   TYPES
------------------------------*/

export type TicketStatus =
  | "Nouvelle demande"
  | "En cours"
  | "Programmé"
  | "Résolu"
  | "Urgent";

export type TicketPriority = "normal" | "elevee" | "critique";

export type Ticket = {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;

  // 🔹 Infos contact
  requester_name: string | null;
  phone: string | null;          // ✅ AJOUTÉ
  email: string | null;          // ✅ AJOUTÉ
  property_address: string | null;

  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

/* -----------------------------
   KANBAN COLUMNS (VERSION PREMIUM)
------------------------------*/

export const STATUS_COLUMNS: {
  id: TicketStatus;
  label: string;
  color: string;
}[] = [
  {
    id: "Urgent",
    label: "Urgent",
    color: "border-red-300 bg-red-50 shadow-sm",
  },
  {
    id: "Nouvelle demande",
    label: "Nouvelles demandes",
    color: "border-blue-300 bg-blue-50 shadow-sm",
  },
  {
    id: "En cours",
    label: "En cours",
    color: "border-amber-300 bg-amber-50 shadow-sm",
  },
  {
    id: "Programmé",
    label: "Programmés",
    color: "border-purple-300 bg-purple-50 shadow-sm",
  },
  {
    id: "Résolu",
    label: "Résolus",
    color: "border-emerald-300 bg-emerald-50 shadow-sm",
  },
];

/* -----------------------------
   BADGES PREMIUM (STATUT)
------------------------------*/

export function statusBadgeColor(status: TicketStatus) {
  switch (status) {
    case "Urgent":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Nouvelle demande":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "En cours":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Programmé":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    case "Résolu":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}

/* -----------------------------
   BADGES PREMIUM (PRIORITÉ)
------------------------------*/

export function priorityBadgeColor(priority: TicketPriority) {
  switch (priority) {
    case "critique":
      return "bg-red-100 text-red-700 border border-red-200";
    case "elevee":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "normal":
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
}
