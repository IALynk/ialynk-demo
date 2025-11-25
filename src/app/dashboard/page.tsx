"use client";

import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { RecentActivity } from "@/components/RecentActivity";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const [newContact, setNewContact] = useState({
    full_name: "",
    email: "",
    phone: "",
    source: "",
    status: "new",
  });

  // Chargement des données
  useEffect(() => {
    fetchRecentMessages();
    fetchTickets();
    fetchContacts();

    const channel = supabase
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacts" },
        (payload) => {
          setContacts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
    if (!error && data) setRecentMessages(data);
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
    if (!error && data) setTickets(data);
  };

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setContacts(data);
    setLoadingContacts(false);
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("contacts").insert([newContact]);
    if (!error) {
      setNewContact({
        full_name: "",
        email: "",
        phone: "",
        source: "",
        status: "new",
      });
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <section className="flex flex-col flex-1 p-8 space-y-6">
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Stats globales */}
          <StatsCards />

          {/* Section Messages récents */}
          <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-semibold mb-4">Messages récents</h2>
            {recentMessages.length === 0 ? (
              <p className="text-gray-400 italic">Aucun message récent.</p>
            ) : (
              <table className="w-full">
                <thead className="border-b text-gray-500 text-sm">
                  <tr>
                    <th className="pb-2 text-left">Expéditeur</th>
                    <th className="pb-2 text-left">Contenu</th>
                    <th className="pb-2 text-right">Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMessages.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-2 font-semibold">
                        {m.role === "assistant" ? "🤖 IA" : "👤 Utilisateur"}
                      </td>
                      <td className="py-2 text-gray-700 truncate max-w-xs">{m.content}</td>
                      <td className="py-2 text-gray-400 text-sm text-right">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Section activité + tickets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
              <RecentActivity />
            </Card>

            <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tickets récents</h2>
                <a
                  href="/tickets/nouveau"
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  + Ajouter un ticket
                </a>
              </div>
              {tickets.length === 0 ? (
                <p className="text-gray-400 italic">Aucun ticket récent.</p>
              ) : (
                <table className="w-full">
                  <thead className="border-b text-gray-500 text-sm">
                    <tr>
                      <th className="pb-2 text-left">Titre</th>
                      <th className="pb-2 text-left">Statut</th>
                      <th className="pb-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-2 font-medium">{t.title}</td>
                        <td className="py-2 text-gray-600">
                          {t.status === "en_cours" ? "En cours" : "Programmé"}
                        </td>
                        <td className="py-2 text-gray-400 text-sm text-right">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          {/* Section contacts CRM */}
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Contacts IALynk
            </h2>

            {/* Formulaire ajout */}
            <form
              onSubmit={addContact}
              className="grid grid-cols-6 gap-2 mb-4 bg-gray-100 p-4 rounded-lg"
            >
              <input
                className="col-span-1 p-2 rounded bg-white border text-gray-800"
                placeholder="Nom complet"
                value={newContact.full_name}
                onChange={(e) =>
                  setNewContact({ ...newContact, full_name: e.target.value })
                }
                required
              />
              <input
                className="col-span-1 p-2 rounded bg-white border text-gray-800"
                placeholder="Email"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
              />
              <input
                className="col-span-1 p-2 rounded bg-white border text-gray-800"
                placeholder="Téléphone"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
              />
              <input
                className="col-span-1 p-2 rounded bg-white border text-gray-800"
                placeholder="Source (site, appel...)"
                value={newContact.source}
                onChange={(e) =>
                  setNewContact({ ...newContact, source: e.target.value })
                }
              />
              <select
                className="col-span-1 p-2 rounded bg-white border text-gray-800"
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
            {loadingContacts ? (
              <p className="text-gray-400 italic">Chargement des contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-gray-400 italic">Aucun contact pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-200 text-gray-700 uppercase text-sm">
                    <tr>
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Téléphone</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-gray-800">
                    {contacts.map((c) => (
                      <tr key={c.id} className="border-t border-gray-200">
                        <td className="px-4 py-3">{c.full_name}</td>
                        <td className="px-4 py-3">{c.email}</td>
                        <td className="px-4 py-3">{c.phone}</td>
                        <td className="px-4 py-3">{c.source}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              c.status === "new"
                                ? "bg-blue-600 text-white"
                                : c.status === "in_progress"
                                ? "bg-yellow-500 text-white"
                                : "bg-green-600 text-white"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(c.created_at).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
