"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Contact = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({
    full_name: "",
    email: "",
    phone: "",
    source: "",
    status: "new",
  });

  // Charger les contacts existants
  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setContacts(data);
      setLoading(false);
    };

    fetchContacts();

    // Abonnement en temps réel
    const channel = supabase
      .channel("contacts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          console.log("Realtime update:", payload);
          if (payload.eventType === "INSERT") {
            setContacts((prev) => [payload.new as Contact, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Ajouter un nouveau contact
  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("contacts").insert([newContact]);
    if (!error && data) {
      setNewContact({
        full_name: "",
        email: "",
        phone: "",
        source: "",
        status: "new",
      });
    }
  };

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Contacts IALynk</h1>

      {/* Formulaire d'ajout */}
      <form
        onSubmit={addContact}
        className="grid grid-cols-6 gap-2 bg-gray-900 p-4 rounded-xl"
      >
        <input
          className="col-span-1 p-2 rounded bg-gray-800 text-white"
          placeholder="Nom complet"
          value={newContact.full_name}
          onChange={(e) =>
            setNewContact({ ...newContact, full_name: e.target.value })
          }
          required
        />
        <input
          className="col-span-1 p-2 rounded bg-gray-800 text-white"
          placeholder="Email"
          value={newContact.email}
          onChange={(e) =>
            setNewContact({ ...newContact, email: e.target.value })
          }
        />
        <input
          className="col-span-1 p-2 rounded bg-gray-800 text-white"
          placeholder="Téléphone"
          value={newContact.phone}
          onChange={(e) =>
            setNewContact({ ...newContact, phone: e.target.value })
          }
        />
        <input
          className="col-span-1 p-2 rounded bg-gray-800 text-white"
          placeholder="Source (ex: site, appel)"
          value={newContact.source}
          onChange={(e) =>
            setNewContact({ ...newContact, source: e.target.value })
          }
        />
        <select
          className="col-span-1 p-2 rounded bg-gray-800 text-white"
          value={newContact.status}
          onChange={(e) =>
            setNewContact({ ...newContact, status: e.target.value })
          }
        >
          <option value="new">Nouveau</option>
          <option value="in_progress">En cours</option>
          <option value="converted">Converti</option>
        </select>
        <button
          type="submit"
          className="col-span-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
        >
          Ajouter
        </button>
      </form>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-gray-300 uppercase text-sm">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-gray-700">
                <td className="px-4 py-3">{contact.full_name}</td>
                <td className="px-4 py-3">{contact.email}</td>
                <td className="px-4 py-3">{contact.phone}</td>
                <td className="px-4 py-3">{contact.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      contact.status === "new"
                        ? "bg-blue-600"
                        : contact.status === "in_progress"
                        ? "bg-yellow-600"
                        : "bg-green-600"
                    }`}
                  >
                    {contact.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(contact.created_at).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
