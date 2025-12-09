"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Phone, Mail, MessageCircle, Edit, Trash2, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContactModal from "@/components/ContactModal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔧 Séparation prénom / nom
function splitName(fullName: string | null) {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(" ");
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  // ---------------------------------------------------------
  // 🔥 Chargement initial + Realtime (INSERT)
  // ---------------------------------------------------------
  useEffect(() => {
    // FIX: useEffect ne peut PAS être async → wrapper interne
    async function init() {
      await loadContacts();
    }

    init();

    const channel = supabase
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacts" },
        (payload) => {
          console.log("🔥 Contact ajouté (realtime):", payload.new);
          setContacts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ---------------------------------------------------------
  // 🔁 Chargement depuis Supabase
  // ---------------------------------------------------------
  async function loadContacts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur loadContacts :", error);
    } else {
      setContacts(data || []);
    }

    setLoading(false);
  }

  // ---------------------------------------------------------
  // 🔍 Recherche
  // ---------------------------------------------------------
  const filteredContacts = contacts.filter((c) => {
    const fields = [
      c.full_name,
      c.email,
      c.phone,
      c.type,
      c.city,
      c.country,
    ]
      .filter(Boolean)
      .map((v: string) => v.toLowerCase());

    return fields.some((v: string) =>
      v.includes(search.toLowerCase().trim())
    );
  });

  // ---------------------------------------------------------
  // 🔥 UI
  // ---------------------------------------------------------
  return (
    <main className="flex min-h-screen bg-gray-50 text-gray-900">
      <div className="flex-1 p-8">
        <PageHeader title="Contacts" />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contacts</h1>

          {/* Bouton Ajouter */}
          <button
            onClick={() => {
              setSelectedContact(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={18} /> Ajouter un contact
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher un contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-1/3 shadow-sm bg-white"
          />
        </div>

        {/* Tableau */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-100 text-gray-700">
                <th className="p-3">Prénom</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Email</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Adresse</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Chargement */}
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-gray-400 italic text-center">
                    Chargement...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-gray-400 italic text-center">
                    Aucun contact trouvé.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => {
                  const { firstName, lastName } = splitName(c.full_name);

                  return (
                    <tr
                      key={c.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 font-semibold">{firstName || "—"}</td>
                      <td className="p-3 font-semibold">{lastName || "—"}</td>

                      <td className="p-3 text-gray-700">{c.type ?? "—"}</td>

                      <td className="p-3">{c.email}</td>
                      <td className="p-3">{c.phone}</td>

                      <td className="p-3 text-gray-600">
                        {c.street
                          ? `${c.street}, ${c.postal_code} ${c.city}, ${c.country}`
                          : "—"}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-end gap-3">

                          {/* Appeler */}
                          <a
                            href={`tel:${c.phone}`}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                          >
                            <Phone size={18} />
                          </a>

                          {/* SMS */}
                          <a
                            href={`sms:${c.phone}`}
                            className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                          >
                            <MessageCircle size={18} />
                          </a>

                          {/* Email */}
                          <a
                            href={`mailto:${c.email}`}
                            className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200"
                          >
                            <Mail size={18} />
                          </a>

                          {/* Modifier */}
                          <button
                            onClick={() => {
                              setSelectedContact(c);
                              setOpenModal(true);
                            }}
                            className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                          >
                            <Edit size={18} />
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={async () => {
                              if (confirm("Supprimer ce contact ?")) {
                                await supabase.from("contacts").delete().eq("id", c.id);
                                setContacts((prev) => prev.filter((p) => p.id !== c.id));
                              }
                            }}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout / édition */}
      <ContactModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        contact={selectedContact}
        refresh={loadContacts}
      />
    </main>
  );
}
