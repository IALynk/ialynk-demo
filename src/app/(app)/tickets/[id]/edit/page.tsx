"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { TicketPriority, TicketStatus } from "@/lib/tickets";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORY_OPTIONS = [
  "Visite",
  "Demande d’informations",
  "Dossier locatif",
  "Problème technique",
  "Travaux / entretien",
  "Renouvellement de bail",
  "Impayé",
  "Autre",
];

export default function EditTicketPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // --- Champs du ticket
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Visite");
  const [status, setStatus] = useState<TicketStatus>("Nouvelle demande");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [requesterName, setRequesterName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // --- Valeurs originales pour détecter les modifications
  const [original, setOriginal] = useState<any>({});

  useEffect(() => {
    loadTicket();
    loadHistory();
  }, [id]);

  async function loadTicket() {
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setTitle(data.title);
      setDescription(data.description || "");
      setCategory(data.category || "Visite");
      setStatus(data.status || "Nouvelle demande");
      setPriority(data.priority || "normal");
      setRequesterName(data.requester_name || "");
      setPropertyAddress(data.property_address || "");
      setAssignedTo(data.assigned_to || "");

      setOriginal(data);
    }

    setLoading(false);
  }

  async function loadHistory() {
    const { data } = await supabase
      .from("ticket_history")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: false });

    setHistory(data || []);
  }

  // --- Ajouter les modifications dans l’historique
  async function addHistory(field: string, oldVal: string, newVal: string) {
    await supabase.from("ticket_history").insert({
      ticket_id: id,
      field,
      old_value: oldVal,
      new_value: newVal,
    });
  }

  // --- Sauvegarder le ticket
  async function handleUpdate() {
    setSaving(true);

    const updates: any = {};
    const track: any[] = [];

    if (title !== original.title) {
      updates.title = title;
      track.push(["title", original.title, title]);
    }
    if (description !== original.description) {
      updates.description = description;
      track.push(["description", original.description, description]);
    }
    if (category !== original.category) {
      updates.category = category;
      track.push(["category", original.category, category]);
    }
    if (status !== original.status) {
      updates.status = status;
      track.push(["status", original.status, status]);
    }
    if (priority !== original.priority) {
      updates.priority = priority;
      track.push(["priority", original.priority, priority]);
    }
    if (requesterName !== original.requester_name) {
      updates.requester_name = requesterName;
      track.push(["requester_name", original.requester_name, requesterName]);
    }
    if (propertyAddress !== original.property_address) {
      updates.property_address = propertyAddress;
      track.push(["property_address", original.property_address, propertyAddress]);
    }
    if (assignedTo !== original.assigned_to) {
      updates.assigned_to = assignedTo;
      track.push(["assigned_to", original.assigned_to, assignedTo]);
    }

    updates.updated_at = new Date().toISOString();

    // Enregistrer le ticket
    await supabase.from("tickets").update(updates).eq("id", id);

    // Ajouter dans l’historique
    for (const [field, oldVal, newVal] of track) {
      await addHistory(field, oldVal, newVal);
    }

    setSaving(false);
    router.push(`/tickets/${id}`);
  }

  // --- Supprimer le ticket
  async function deleteTicket() {
    if (!confirm("Voulez-vous vraiment supprimer ce ticket ?")) return;

    await supabase.from("tickets").delete().eq("id", id);
    router.push("/tickets");
  }

  if (loading) return <div className="p-6">Chargement…</div>;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">

      {/* Retour */}
      <button
        onClick={() => router.push(`/tickets/${id}`)}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Retour au ticket
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Modifier le ticket</h1>
          <p className="text-sm text-gray-500">Mettez à jour les informations du ticket.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPreview(true)}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Aperçu
          </button>

          <button
            onClick={deleteTicket}
            className="px-4 py-2 text-sm border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium">Titre</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium">Description</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]"
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Catégorie</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium">Statut</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
                <option>Nouvelle demande</option>
                <option>En cours</option>
                <option>Programmé</option>
                <option>Résolu</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">

          <div>
            <label className="text-xs font-medium">Locataire / prospect</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium">Adresse du bien</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium">Assigné à</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          </div>
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={saving}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm"
      >
        {saving ? "Mise à jour…" : "Mettre à jour le ticket"}
      </button>

      {/* Historique */}
      <div className="border rounded-lg p-4 bg-white mt-6">
        <h2 className="text-sm font-semibold mb-3">Historique des modifications</h2>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune modification enregistrée.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="border rounded-lg p-2 bg-gray-50">
                <b>{h.field}</b> modifié  
                <div className="text-xs text-gray-500">
                  {new Date(h.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="text-gray-500">Avant :</span> {h.old_value || "-"}
                </div>
                <div>
                  <span className="text-gray-500">Après :</span> {h.new_value || "-"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* APERÇU */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-xl space-y-4">

            <h2 className="text-lg font-semibold">Aperçu du ticket</h2>

            <p><b>Titre :</b> {title}</p>
            <p><b>Description :</b><br /> {description || "(vide)"}</p>
            <p><b>Catégorie :</b> {category}</p>
            <p><b>Statut :</b> {status}</p>
            <p><b>Priorité :</b> {priority}</p>
            <p><b>Locataire :</b> {requesterName || "-"}</p>
            <p><b>Adresse :</b> {propertyAddress || "-"}</p>
            <p><b>Assigné à :</b> {assignedTo || "-"}</p>

            <button
              onClick={() => setPreview(false)}
              className="px-4 py-2 border rounded-lg w-full mt-3"
            >
              Fermer l’aperçu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
