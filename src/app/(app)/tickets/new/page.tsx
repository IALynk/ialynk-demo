"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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

export default function NewTicketPage() {
  const router = useRouter();

  // Infos du ticket
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Visite");
  const [status, setStatus] = useState("Nouvelle demande");
  const [priority, setPriority] = useState("normal");

  // Locataire / prospect
  const [requesterName, setRequesterName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // Aperçu
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!title.trim()) {
      alert("Veuillez entrer un titre.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          title,
          description,
          category,
          status,
          priority,

          // Champs corrects du schéma Supabase
          requester_name: requesterName || null,
          phone: phone || null,
          email: email || null,
          property_address: propertyAddress || null,
          assigned_to: assignedTo || null,

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Impossible d'enregistrer : " + error.message);
      setSaving(false);
      return;
    }

    router.push(`/tickets/${data.id}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Retour */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Retour
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Créer un ticket</h1>
          <p className="text-sm text-gray-500">
            Ajoutez les informations du ticket.
          </p>
        </div>

        {/* Aperçu */}
        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
        >
          Aperçu
        </button>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Colonne gauche */}
        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium">Titre</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex : Fuite d’eau..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1 min-h-[120px]"
              placeholder="Détails du problème…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Statut</label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Nouvelle demande</option>
                <option>En cours</option>
                <option>Programmé</option>
                <option>Résolu</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium">Locataire / prospect</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex : Julie Martin"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Téléphone</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex : 06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Adresse email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex : julie@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Adresse du bien</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex : 12 rue Victor Hugo, Paris"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assigné à</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Ex : Léa, Riwan…"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>
        </div>
      </form>

      {/* Bouton créer */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Création..." : "Créer le ticket"}
      </button>

      {/* Aperçu (modale) */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">

            <h2 className="text-xl font-semibold mb-4">Aperçu du ticket</h2>

            <p><b>Titre :</b> {title || "(vide)"}</p>
            <p><b>Description :</b> {description || "(vide)"}</p>
            <p><b>Catégorie :</b> {category}</p>
            <p><b>Statut :</b> {status}</p>
            <p><b>Priorité :</b> {priority}</p>
            <p><b>Nom :</b> {requesterName || "-"}</p>
            <p><b>Téléphone :</b> {phone || "-"}</p>
            <p><b>Email :</b> {email || "-"}</p>
            <p><b>Adresse :</b> {propertyAddress || "-"}</p>
            <p><b>Assigné à :</b> {assignedTo || "-"}</p>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
