"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditTicketPage() {
  const { id } = useParams();
  const router = useRouter();

  const ticketId = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "" }>({
    message: "",
    type: "",
  });

  // Original ticket values (for change detection)
  const [originalData, setOriginalData] = useState<any>({});

  // FORM STATES
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // LOAD DATA
  useEffect(() => {
    if (!ticketId) return;
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error || !data) {
      console.error("Erreur chargement :", error);
      return;
    }

    setOriginalData(data);

    setTitle(data.title || "");
    setDescription(data.description || "");
    setCategory(data.category || "");
    setStatus(data.status || "");
    setRequesterName(data.requester_name || "");
    setPropertyAddress(data.property_address || "");
    setAssignedTo(data.assigned_to || "");
    setPhone(data.phone || "");
    setEmail(data.email || "");

    setLoading(false);
  }

  // UTIL FUNCTION — SHOW TOAST
  function showToast(message: string, type: "success" | "error" | "warning") {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  }

  // VALIDATION
  function validateFields() {
    if (!title || !description || !category || !status || !requesterName) {
      showToast("Certains champs sont obligatoires.", "warning");
      return false;
    }
    return true;
  }

  // PREVENT SAVE IF NOTHING CHANGED
  function nothingChanged() {
    return (
      originalData.title === title &&
      originalData.description === description &&
      originalData.category === category &&
      originalData.status === status &&
      originalData.requester_name === requesterName &&
      originalData.property_address === propertyAddress &&
      originalData.assigned_to === assignedTo &&
      originalData.phone === phone &&
      originalData.email === email
    );
  }

  // UPDATE
  async function updateTicket() {
    if (!validateFields()) return;

    if (nothingChanged()) {
      showToast("Aucune modification détectée.", "warning");
      return;
    }

    const confirmSave = window.confirm(
      "Êtes-vous sûr de vouloir enregistrer les nouvelles informations du ticket ?"
    );
    if (!confirmSave) return;

    setSaving(true);

    const { error } = await supabase
      .from("tickets")
      .update({
        title,
        description,
        category,
        status,
        requester_name: requesterName,
        property_address: propertyAddress,
        assigned_to: assignedTo,
        phone,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    setSaving(false);

    if (error) {
      console.error("UPDATE ERROR :", error);
      showToast("Erreur : impossible de mettre à jour.", "error");
      return;
    }

    showToast("Le ticket a bien été mis à jour ✓", "success");

    setTimeout(() => {
      router.push(`/tickets/${ticketId}`);
    }, 900);
  }

  if (loading) {
    return <div className="p-6 text-gray-500 text-sm">Chargement…</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* TOAST */}
      {toast.message && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white text-sm transition
            ${toast.type === "success" ? "bg-green-600" : ""}
            ${toast.type === "error" ? "bg-red-600" : ""}
            ${toast.type === "warning" ? "bg-yellow-500" : ""}
          `}
        >
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-4">

        {/* 🔙 BUTTON */}
        <Link
          href="/tickets"
          className="text-gray-600 hover:text-black text-sm flex items-center gap-1"
        >
          ← Retour
        </Link>

        {/* TITLE */}
        <Link
          href={`/tickets/${ticketId}`}
          className="text-2xl font-semibold hover:underline"
        >
          Modifier le ticket
        </Link>

      </div>

      <p className="text-sm text-gray-500">Mettez à jour les informations du ticket.</p>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Each form field unchanged */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Titre *</label>
          <input className="border rounded-lg p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Locataire / prospect *</label>
          <input className="border rounded-lg p-2" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium mb-1">Description *</label>
          <textarea className="border rounded-lg p-2 h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Adresse du bien</label>
          <input className="border rounded-lg p-2" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Assigné à</label>
          <input className="border rounded-lg p-2" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Téléphone</label>
          <input className="border rounded-lg p-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Email</label>
          <input type="email" className="border rounded-lg p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Catégorie *</label>
          <select className="border rounded-lg p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Visite</option>
            <option>Demande d’informations</option>
            <option>Dossier locatif</option>
            <option>Problème technique</option>
            <option>Travaux / entretien</option>
            <option>Renouvellement de bail</option>
            <option>Impayé</option>
            <option>Autre</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Statut *</label>
          <select className="border rounded-lg p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Nouvelle demande</option>
            <option>En cours</option>
            <option>En attente</option>
            <option>Résolu</option>
          </select>
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-4">

        {/* UPDATE BUTTON */}
        <button
          onClick={updateTicket}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white transition 
            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {saving ? "Enregistrement..." : "Mettre à jour le ticket"}
        </button>

        {/* CANCEL BUTTON */}
        <Link
          href={`/tickets/${ticketId}`}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Annuler
        </Link>

      </div>

    </div>
  );
}
