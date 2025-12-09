"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  Mail,
  MailOpen,
  Phone,
  Reply,
  EyeOff,
  Bot,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Texte final dans la zone réponse
  const [replyText, setReplyText] = useState("");

  // 3 réponses IA
  const [aiReplies, setAiReplies] = useState({
    short: "",
    neutral: "",
    formal: "",
  });

  useEffect(() => {
    fetchMessages();
  }, [sortBy]);

  async function fetchMessages() {
    setLoading(true);

    let query = supabase.from("messages").select("*");

    if (sortBy === "recent") query = query.order("created_at", { ascending: false });
    if (sortBy === "oldest") query = query.order("created_at", { ascending: true });
    if (sortBy === "unread") query = query.eq("is_read", false);
    if (sortBy === "read") query = query.eq("is_read", true);

    const { data } = await query;
    setMessages(data || []);
    setLoading(false);
  }

  const filtered = messages.filter((m) =>
    m.content?.toLowerCase().includes(search.toLowerCase())
  );

  async function markAsUnread(msg: any) {
    await supabase.from("messages").update({ is_read: false }).eq("id", msg.id);
    fetchMessages();
  }

  async function openMessage(msg: any) {
    if (!msg.is_read) {
      await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
    }

    setSelectedMessage({ ...msg, is_read: true });
    setReplyText("");
    setAiReplies({ short: "", neutral: "", formal: "" });
    fetchMessages();
  }

  // Génère 3 réponses IA
  async function generateAIReply() {
    if (!selectedMessage) return;

    const response = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageContent: selectedMessage.content,
        contact: {
          name: selectedMessage.sender,
          email: selectedMessage.email || "",
          phone: selectedMessage.phone || "",
        },
      }),
    });

    const data = await response.json();

    setAiReplies({
      short: data.short,
      neutral: data.neutral,
      formal: data.formal,
    });
  }

  return (
    <main className="px-10 py-8 bg-[#F7F9FC] min-h-screen">

      <PageHeader title="Messages" />

      {/* Top Bar */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            placeholder="Rechercher un message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 rounded-xl border border-gray-200 bg-white shadow-sm"
          />
        </div>

        <select
          className="px-4 py-2 rounded-xl border bg-white shadow-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="unread">Non lus</option>
          <option value="read">Lus</option>
        </select>
      </div>

      {/* Layout */}
      <div className="flex gap-6">

        {/* LEFT PANEL */}
        <div className="w-1/2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-400 italic">Chargement...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F2F3F5] text-gray-600 text-sm">
                <tr>
                  <th className="py-4 px-6 text-left">Expéditeur</th>
                  <th className="py-4 px-6 text-left">Contenu</th>
                  <th className="py-4 px-6 text-center">Statut</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((m, i) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      selectedMessage?.id === m.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => openMessage(m)}
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {m.sender}
                    </td>

                    <td className="py-4 px-6 text-gray-700 max-w-xs truncate">
                      {m.content}
                    </td>

                    <td className="py-4 px-6 text-center">
                      {m.is_read ? (
                        <span className="flex justify-center items-center gap-1 text-green-600 font-medium text-sm">
                          <MailOpen size={16} /> Lu
                        </span>
                      ) : (
                        <span className="flex justify-center items-center gap-1 text-red-600 font-medium text-sm">
                          <Mail size={16} /> Non lu
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          {!selectedMessage ? (
            <p className="text-gray-400 text-center mt-20">
              Sélectionnez un message pour afficher son contenu
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full flex flex-col"
            >

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedMessage.sender}</h2>

                <div className="flex gap-4 items-center">
                  <Phone size={22} className="text-green-600 cursor-pointer hover:scale-110 transition" />
                  <Reply size={22} className="text-blue-600 cursor-pointer hover:scale-110 transition" />
                  <EyeOff
                    size={22}
                    className="text-orange-600 cursor-pointer hover:scale-110 transition"
                    onClick={() => markAsUnread(selectedMessage)}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                {new Date(selectedMessage.created_at).toLocaleString("fr-FR")}
              </p>

              <div className="border-t pt-4 text-gray-800 leading-relaxed">
                {selectedMessage.content}
              </div>

              {/* ZONE DE RÉPONSE */}
              <div className="mt-auto pt-6">
                <textarea
                  placeholder="Écrire une réponse..."
                  className="w-full border rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-black/10"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />

                <div className="flex gap-3 mt-3">

                  {/* BUTTON IA */}
                  <button
                    onClick={generateAIReply}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow transition"
                  >
                    <Bot size={18} />
                    Réponse IA
                  </button>

                  {/* BUTTON SEND */}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow">
                    Envoyer
                  </button>
                </div>

                {/* --------  AFFICHAGE DES 3 RÉPONSES AVEC CONTOUR MULTICOLORE -------- */}
                {aiReplies.short && (
                  <div className="mt-6 space-y-5">

                    {/* COURTE */}
                    <div
                      onClick={() => setReplyText(aiReplies.short)}
                      className="relative p-[2px] rounded-xl cursor-pointer hover:scale-[1.02] transition"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-x opacity-90"></div>
                      <div className="relative bg-white rounded-xl p-4">
                        <p className="font-semibold text-gray-900">Réponse courte :</p>
                        <p className="text-gray-700 mt-1">{aiReplies.short}</p>
                      </div>
                    </div>

                    {/* NEUTRE */}
                    <div
                      onClick={() => setReplyText(aiReplies.neutral)}
                      className="relative p-[2px] rounded-xl cursor-pointer hover:scale-[1.02] transition"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500 animate-gradient-x opacity-90"></div>
                      <div className="relative bg-white rounded-xl p-4">
                        <p className="font-semibold text-gray-900">Réponse neutre :</p>
                        <p className="text-gray-700 mt-1">{aiReplies.neutral}</p>
                      </div>
                    </div>

                    {/* FORMELLE */}
                    <div
                      onClick={() => setReplyText(aiReplies.formal)}
                      className="relative p-[2px] rounded-xl cursor-pointer hover:scale-[1.02] transition"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 animate-gradient-x opacity-90"></div>
                      <div className="relative bg-white rounded-xl p-4">
                        <p className="font-semibold text-gray-900">Réponse formelle :</p>
                        <p className="text-gray-700 mt-1">{aiReplies.formal}</p>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </motion.div>
          )}
        </div>

      </div>
    </main>
  );
}
