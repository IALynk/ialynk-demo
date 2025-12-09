"use client";

import { useState, useEffect, useRef } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  Edit2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = { role: "user" | "assistant"; content: string };

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

type Agency = {
  id: string;
  name: string;
};

type UserPreferences = {
  dark_mode: boolean;
};

export default function AssistantPage() {
  // STATE
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [canRegenerate, setCanRegenerate] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("Vous");
  const [agency, setAgency] = useState<Agency | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isDark, setIsDark] = useState(false);

  const [editingConversationId, setEditingConversationId] =
    useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick prompt dynamiques
  const agencyName = agency?.name ?? "ton agence";
  const quickPrompts = [
    `Prépare le programme de prospection d’aujourd’hui pour ${agencyName}.`,
    `Rédige une réponse professionnelle à un locataire mécontent pour ${agencyName}.`,
    `Propose un script téléphonique pour rappeler un prospect intéressé par un bien de ${agencyName}.`,
    `Liste les 5 tâches prioritaires pour ${agencyName} aujourd’hui.`,
  ];

  // Scroll auto
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => scrollToBottom(), [messages, loading]);

  // ==============================
  // INITIALISATION
  // ==============================
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // PROFIL
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, agency_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) setUserName(profile.full_name);

        if (profile?.agency_id) {
          const { data: agencyData } = await supabase
            .from("agencies")
            .select("id, name")
            .eq("id", profile.agency_id)
            .maybeSingle();

          if (agencyData) setAgency(agencyData as Agency);
        }

        // PREFS
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("dark_mode")
          .eq("user_id", user.id)
          .maybeSingle();

        if (prefs) {
          setPreferences(prefs as UserPreferences);
          setIsDark(!!prefs.dark_mode);
        }

        fetchConversations(user.id);
      } else {
        fetchConversations();
      }
    };

    init();
  }, []);

  // ==============================
  // CONVERSATIONS
  // ==============================
  const fetchConversations = async (userId?: string) => {
    let query = supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query;
    if (!error) setConversations((data as Conversation[]) || []);
  };

  const loadMessages = async (id: string) => {
    setConversationId(id);
    setLoading(false);
    setCanRegenerate(false);

    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      );
    }
  };

  const startNewConversation = async () => {
    const newId = uuidv4();

    await supabase.from("conversations").insert({
      id: newId,
      user_id: user?.id ?? null,
      agency_id: agency?.id ?? null,
      title: "Nouvelle conversation",
    });

    setConversationId(newId);
    setMessages([]);
    setInput("");
    setLoading(false);
    setCanRegenerate(false);

    if (user?.id) fetchConversations(user.id);
    else fetchConversations();
  };

  // Renommage conversation
  const startRename = (conv: Conversation) => {
    setEditingConversationId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveRename = async () => {
    if (!editingConversationId) return;

    const newTitle = editingTitle.trim() || "Sans titre";

    await supabase
      .from("conversations")
      .update({ title: newTitle })
      .eq("id", editingConversationId);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === editingConversationId ? { ...c, title: newTitle } : c
      )
    );

    setEditingConversationId(null);
    setEditingTitle("");
  };

  const cancelRename = () => {
    setEditingConversationId(null);
    setEditingTitle("");
  };

  // ==============================
  // MESSAGES
  // ==============================
  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  const sendMessage = async (forcedInput?: string) => {
    const text = (forcedInput ?? input).trim();
    if (!text || loading) return;

    let id = conversationId;

    // CRÉATION CONVERSATION SI ABSENTE
    if (!id) {
      id = uuidv4();

      await supabase.from("conversations").insert({
        id,
        user_id: user?.id ?? null,
        agency_id: agency?.id ?? null,
        title: text.slice(0, 60),
      });

      setConversationId(id);
      if (user?.id) fetchConversations(user.id);
      else fetchConversations();
    }

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];

    setMessages(history);
    if (!forcedInput) setInput("");
    setLoading(true);
    setCanRegenerate(false);

    // API CALL
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          agency: agency ?? undefined,
          userName,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const assistantMsg: Message = {
          role: "assistant",
          content: data.reply,
        };

        const updated = [...history, assistantMsg];

        setMessages(updated);
        setCanRegenerate(true);

        await supabase.from("messages").insert([
          { role: "user", content: text, conversation_id: id },
          { role: "assistant", content: data.reply, conversation_id: id },
        ]);

        if (user?.id) fetchConversations(user.id);
        else fetchConversations();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Erreur de connexion à l’IA." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!canRegenerate) return;

    const lastIsAssistant = messages[messages.length - 1].role === "assistant";
    const base = lastIsAssistant
      ? messages.slice(0, messages.length - 1)
      : messages;

    setMessages(base);
    setLoading(true);
    setCanRegenerate(false);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: base,
          agency,
          userName,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const msg = { role: "assistant", content: data.reply };
        const updated = [...base, msg];

        setMessages(updated);
        setCanRegenerate(true);

        if (conversationId) {
          await supabase.from("messages").insert([
            {
              role: "assistant",
              content: data.reply,
              conversation_id: conversationId,
            },
          ]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DARK MODE
  // ==============================
  const toggleDarkMode = async () => {
    const newValue = !isDark;
    setIsDark(newValue);

    if (!user) return;

    await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        dark_mode: newValue,
      },
      { onConflict: "user_id" }
    );
  };

  // ==============================
  // RENDER — VERSION ULTRA PREMIUM
  // ==============================
  return (
    <div className={isDark ? "dark h-screen" : "h-screen"}>
      <main
        className="flex min-h-screen text-neutral-900 dark:text-neutral-100 transition-all"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0B1220 0%, #1A163A 30%, #262B5A 70%, #06B6D4 100%)"
            : "linear-gradient(135deg, #F0F4FF 0%, #EBE9FF 40%, #E0E7FF 100%)",
        }}
      >
        {/* ================= SIDEBAR ================= */}
        <aside className="w-72 backdrop-blur-2xl bg-white/40 dark:bg-black/30 border-r border-white/30 dark:border-white/10 shadow-2xl flex flex-col rounded-r-3xl">
          <div className="px-5 py-4 border-b border-white/20 dark:border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Conversations</h2>
              <p className="text-xs opacity-70">{agencyName}</p>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={startNewConversation}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:scale-[1.02] transform transition text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Nouvelle conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
            {conversations.length === 0 ? (
              <p className="text-xs opacity-70 italic px-2">
                Aucune conversation.
              </p>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === conversationId;
                const isEditing = editingConversationId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center rounded-xl px-3 py-2 text-sm cursor-pointer transition ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/40 to-purple-600/40 text-white shadow-lg"
                        : "hover:bg-white/40 dark:hover:bg-white/10"
                    }`}
                  >
                    <button
                      onClick={() => loadMessages(conv.id)}
                      className="flex-1 text-left truncate"
                    >
                      {isEditing ? (
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={saveRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          autoFocus
                          className="w-full bg-transparent outline-none"
                        />
                      ) : (
                        <span className="truncate">{conv.title}</span>
                      )}
                      <p className="text-[11px] opacity-60">
                        {new Date(conv.created_at).toLocaleString()}
                      </p>
                    </button>

                    {!isEditing && (
                      <button
                        onClick={() => startRename(conv)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/20 transition ml-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <div className="flex-1 flex flex-col relative">

          {/* ---------- HEADER ---------- */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10 backdrop-blur-xl bg-black/10">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/20 backdrop-blur-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-sm font-medium">Assistant IALynk</p>
                <p className="text-xs opacity-70">Connecté en tant que {userName}</p>
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/20 backdrop-blur-xl border border-white/20"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* ---------- MESSAGES ---------- */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              // ================= PAGE D'ACCUEIL =================
              <div className="h-full flex flex-col items-center justify-center text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-semibold mb-3"
                >
                  Quel est le programme aujourd’hui ?
                </motion.h1>

                <p className="text-sm opacity-70 mb-10 max-w-xl">
                  Pose une question à l’assistant IALynk pour {agencyName}.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
                  {quickPrompts.map((prompt, i) => {
                    const gradients = [
                      "from-blue-500 to-cyan-400",
                      "from-purple-500 to-pink-500",
                      "from-cyan-500 to-blue-500",
                      "from-pink-500 to-purple-500",
                    ];
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        key={prompt}
                        onClick={() => handleQuickPrompt(prompt)}
                        className={`text-left text-sm px-4 py-4 rounded-2xl text-white shadow-lg bg-gradient-to-r ${gradients[i]} transition`}
                      >
                        {prompt}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // ================= AFFICHAGE CONVERSATION =================
              <div className="max-w-3xl mx-auto">
                {messages.map((m, i) => {
                  const isUser = m.role === "user";

                  return (
                    <div
                      key={i}
                      className={`flex my-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="mr-3 mt-1 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center text-xs font-semibold shadow-lg">
                            IA
                          </div>
                        </div>
                      )}

                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-md backdrop-blur-xl ${
                          isUser
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                            : "bg-white/20 dark:bg-white/10 rounded-bl-none"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-sm opacity-70 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-150" />
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-300" />
                    <span className="ml-2">L’IA écrit…</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ---------- INPUT BAR ---------- */}
          <div className="px-6 py-4 border-t border-white/20 backdrop-blur-xl bg-black/10">
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none bg-white/20 dark:bg-white/10 border border-white/20 backdrop-blur-xl placeholder-white/60"
                  placeholder="Écrivez votre message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm shadow-lg hover:opacity-90 disabled:opacity-40 transition"
                >
                  Envoyer
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] opacity-70">
                <p>IALynk peut se tromper. Vérifie les informations importantes.</p>

                {canRegenerate && (
                  <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="underline hover:text-white transition"
                  >
                    Régénérer
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
