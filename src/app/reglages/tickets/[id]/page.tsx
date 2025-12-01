"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // État pour la mini-popup "modifier"
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setMessage("❌ Erreur lors du chargement.");
    } else {
      setTicket(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
    }
    setLoading(false);
  };

  /** 🔄 Changer le statut */
  const toggleStatus = async () => {
    if (!ticket) return;

    const next =
      ticket.status === "en_cours"
        ? "programmé"
        : ticket.status === "programmé"
        ? "terminé"
        : "en_cours";

    const { error } = await supabase
      .from("tickets")
      .update({ status: next })
      .eq("id", ticket.id);

    if (error) setMessage("❌ Erreur changement statut");
    else {
      setMessage("✅ Statut modifié !");
      fetchTicket();
    }
  };

  /** 📝 Modifier */
  const saveEdit = async () => {
    const { error } = await supabase
      .from("tickets")
      .update({
        title: editTitle,
        description: editDescription,
      })
      .eq("id", ticket.id);

    if (error) setMessage("❌ Erreur modification");
    else {
      setMessage("✅ Mise à jour effectuée !");
      setEditMode(false);
      fetchTicket();
    }
  };

  /** 🗑 Supprimer */
  const handleDelete = async () => {
    if (!confirm("🗑 Supprimer définitivement ?")) return;

    const { error } = await supabase.from("tickets").delete().eq("id", id);

    if (error) setMessage("❌ Erreur suppression");
    else {
      setMessage("✅ Ticket supprimé !");
      setTimeout(() => router.push("/tickets"), 800);
    }
  };

  if (loading)
    return <p className="p-8 text-gray-400 italic">Chargement du ticket...</p>;

  if (!ticket)
    return (
      <main className="p-8">
        <p className="text-gray-500">Ticket introuvable.</p>
        <Link href="/tickets" className="text-blue-600 hover:underline">
          ← Retour aux tickets
        </Link>
      </main>
    );

  return (
    <main className="flex items-center justify-center min-h-screen backdrop-blur-sm">
      {/* Boîte centrale */}
      <div className="bg-white shadow-xl rounded-2xl p-6 w-[450px] relative">

        {/* 🔙 Retour */}
        <Link
          href="/tickets"
          className="absolute -top-10 left-0 text-gray-600 hover:text-black"
        >
          ← Retour
        </Link>

        {/* Ligne du haut */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold">{ticket.title}</h1>

          <div className="flex gap-3">
            {/* Modifier */}
            <button
              onClick={() => setEditMode(true)}
              className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200"
              title="Modifier"
            >
              <Pencil className="w-4 h-4 text-yellow-700" />
            </button>

            {/* Changer statut */}
            <button
              onClick={toggleStatus}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200"
              title="Changer statut"
            >
              <RefreshCw className="w-4 h-4 text-green-700" />
            </button>

            {/* Supprimer */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-red-100 hover:bg-red-200"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-700" />
            </button>
          </div>
        </div>

        {/* Statut */}
        <p className="text-sm mb-3">
          Statut :{" "}
          <span className="font-semibold text-blue-600">{ticket.status}</span>
        </p>

        {/* Description */}
        <p className="text-gray-700 mb-4">{ticket.description}</p>

        {/* Date */}
        <p className="text-xs text-gray-400">
          Créé le : {new Date(ticket.created_at).toLocaleString()}
        </p>

        {/* Bouton fermer */}
        <button
          onClick={() => router.push("/tickets")}
          className="w-full mt-6 bg-gray-900 text-white p-3 rounded-lg hover:bg-black transition"
        >
          Fermer
        </button>

        {/* Message système */}
        {message && (
          <p
            className={`text-center mt-3 ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* ✏️ Popup édition */}
      {editMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Modifier le ticket</h2>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border p-2 rounded h-28"
            />

            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
