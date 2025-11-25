"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import PageHeader from "@/components/PageHeader";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AssistantPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ id: string; last_message: string; created_at: string }[]>([]);

  // 🔹 Récupère toutes les conversations (groupées par ID)
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement conversations :", error);
      return;
    }

    // Grouper par conversation_id (on garde le dernier message)
    const grouped: Record<string, { last_message: string; created_at: string }> = {};
    data.forEach((msg) => {
      if (!grouped[msg.conversation_id]) {
        grouped[msg.conversation_id] = {
          last_message: msg.content,
          created_at: msg.created_at,
        };
      }
    });

    const formatted = Object.entries(grouped).map(([id, v]) => ({
      id,
      last_message: v.last_message,
      created_at: v.created_at,
    }));

    setConversations(formatted);
  };

  // 🔹 Charge les messages d’une conversation
  const loadMessages = async (id: string) => {
    setConversationId(id);
    const { data, error } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (!error && data) setMessages(data);
  };

  // 🔹 Démarrer une nouvelle conversation
  const startNewConversation = () => {
    const newId = uuidv4();
    setConversationId(newId);
    setMessages([]);
  };

  // 🔹 Envoi du message à l'IA
  const sendMessage = async () => {
    if (!input.trim()) return;

    const id = conversationId ?? uuidv4();
    if (!conversationId) setConversationId(id);

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.reply) {
        const updated = [...newMessages, { role: "assistant", content: data.reply }];
        setMessages(updated);

        await supabase.from("messages").insert([
          { role: "user", content: input, conversation_id: id },
          { role: "assistant", content: data.reply, conversation_id: id },
        ]);
        fetchConversations();
      }
    } catch (error) {
      console.error("Erreur :", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Erreur de connexion avec l’IA." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <main className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* --- COLONNE GAUCHE --- */}
      <aside className="w-80 bg-white border-r shadow-sm p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>

        <button
          onClick={startNewConversation}
          className="mb-4 bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-500"
        >
          ➕ Nouvelle conversation
        </button>

        <div className="flex-1 overflow-y-auto space-y-3">
          {conversations.length === 0 ? (
            <p className="text-gray-400 italic text-sm">Aucune conversation.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadMessages(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  conv.id === conversationId
                    ? "bg-blue-100 border border-blue-400"
                    : "hover:bg-gray-100"
                }`}
              >
                <p className="text-sm text-gray-700 line-clamp-2">
                  {conv.last_message || "Conversation vide"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conv.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* --- ZONE DE DISCUSSION --- */}
      <div className="flex-1 p-8 flex flex-col">
        {/* 🟦 En-tête global avec flèche et recherche */}
        <PageHeader title="Assistant IA" />

        <h1 className="text-2xl font-bold mb-4">Assistant IA IALynk</h1>

        <div className="flex-1 bg-white border rounded-xl shadow-sm p-6 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-400 italic">Aucune discussion en cours.</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`my-2 ${
                  m.role === "user"
                    ? "text-blue-600 text-right"
                    : "text-gray-800 text-left"
                }`}
              >
                <strong>{m.role === "user" ? "Vous" : "IA"} :</strong>{" "}
                {m.content}
              </div>
            ))
          )}

          {loading && <p className="text-gray-400 italic mt-2">L’IA réfléchit...</p>}
        </div>

        <div className="flex">
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className={`ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            Envoyer
          </button>
        </div>
      </div>
    </main>
  );
}
