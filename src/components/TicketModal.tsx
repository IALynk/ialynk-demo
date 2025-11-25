"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Edit, CheckCircle, Trash2, Save } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TicketModal({ isOpen, onClose, ticket }: any) {
  if (!ticket) return null;

  // --- STATES POUR ÉDITION ---
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [loading, setLoading] = useState(false);

  // --- METTRE À JOUR (EDIT) ---
  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("tickets")
      .update({
        title,
        description,
      })
      .eq("id", ticket.id);

    setLoading(false);

    if (!error) {
      setEditMode(false);
      onClose();
      window.location.reload();
    }
  };

  // --- MARQUER COMME TERMINÉ ---
  const handleMarkDone = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("tickets")
      .update({ status: "terminé" })
      .eq("id", ticket.id);

    setLoading(false);

    if (!error) {
      onClose();
      window.location.reload();
    }
  };

  // --- SUPPRIMER ---
  const handleDelete = async () => {
    if (!confirm("🗑 Voulez-vous vraiment supprimer ce ticket ?")) return;

    setLoading(true);

    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", ticket.id);

    setLoading(false);

    if (!error) {
      onClose();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-5">
              <div className="w-full pr-5">
                {!editMode ? (
                  <>
                    <h2 className="text-2xl font-semibold">{ticket.title}</h2>
                    <p className="text-gray-500 text-sm">
                      Statut :{" "}
                      <span
                        className={
                          ticket.status === "en_cours"
                            ? "text-blue-600"
                            : ticket.status === "programmé"
                            ? "text-purple-600"
                            : "text-green-600"
                        }
                      >
                        {ticket.status}
                      </span>
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 h-24"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              {!editMode && (
                <div className="flex items-center gap-3">
                  {/* Call */}
                  {ticket.phone && (
                    <button
                      onClick={() =>
                        (window.location.href = `tel:${ticket.phone}`)
                      }
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    >
                      <Phone size={20} />
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                  >
                    <Edit size={20} />
                  </button>

                  {/* Mark resolved */}
                  <button
                    onClick={handleMarkDone}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                  >
                    <CheckCircle size={20} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}

              {editMode && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {!editMode && (
              <div className="text-gray-700 text-base leading-relaxed mb-6">
                {ticket.description || "Aucune description fournie."}
              </div>
            )}

            {/* DATE */}
            {!editMode && (
              <p className="text-sm text-gray-500 mb-6">
                Créé le : {new Date(ticket.created_at).toLocaleString()}
              </p>
            )}

            {/* CLOSE BUTTON */}
            {!editMode && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition"
              >
                Fermer
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
