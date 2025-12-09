"use client";

import { motion, type MotionProps } from "framer-motion";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { statusBadgeColor } from "@/lib/tickets";
import {
  MessageSquare,
  Phone,
  Ticket as TicketIcon,
  CalendarDays,
  UserPlus,
  Bot,
  Search,
  Activity as ActivityIcon,
  Sun,
  Moon,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();

  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  const [newContact, setNewContact] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState("");

  const [isDark, setIsDark] = useState(false);

  // ---------- THEME ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const startDark = stored ? stored === "dark" : prefersDark;

    setIsDark(startDark);
    root.classList.toggle("dark", startDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);

    const root = document.documentElement;
    root.classList.toggle("dark", next);

    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // ---------- DATA ----------
  useEffect(() => {
    loadRecentMessages();
    loadRecentTickets();
    loadRecentCalls();

    const ticketsChannel = supabase
      .channel("tickets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => {
          loadRecentTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, []);

  async function loadRecentMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setRecentMessages(data || []);
  }

  async function loadRecentTickets() {
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentTickets(data || []);
  }

  async function loadRecentCalls() {
    const { data } = await supabase
      .from("calls")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentCalls(data || []);
  }

  async function handleAddQuickContact(e: FormEvent) {
    e.preventDefault();
    if (!newContact.full_name.trim()) return;

    try {
      setIsSavingContact(true);
      await supabase.from("contacts").insert([
        {
          full_name: newContact.full_name,
          email: newContact.email || null,
          phone: newContact.phone || null,
          source: "Dashboard rapide",
          status: "new",
        },
      ]);
      setNewContact({ full_name: "", email: "", phone: "" });
    } finally {
      setIsSavingContact(false);
    }
  }

  function handleAssistantSearch(e: FormEvent) {
    e.preventDefault();
    if (!assistantQuery.trim()) return;
    router.push(`/assistant?query=${encodeURIComponent(assistantQuery.trim())}`);
  }

  // ---------- ANIMATIONS ----------
  const cardHover: MotionProps = {
    whileHover: {
      y: -3,
      scale: 1.01,
    },
    whileTap: { scale: 0.995 },
    transition: { type: "spring", stiffness: 260, damping: 22 },
  };

  // Stats IA dynamiques & graphique
  const iaReplies = recentMessages.filter((m) => m.role === "assistant").length;
  const humanMessages = recentMessages.length - iaReplies;
  const iaResponseRate = recentMessages.length
    ? Math.round((iaReplies / recentMessages.length) * 100)
    : 0;
  const automationIndex = Math.min(
    100,
    iaReplies * 10 + recentTickets.length * 5
  );

  const activityData = [
    { label: "Msgs clients", value: humanMessages },
    { label: "Réponses IA", value: iaReplies },
    { label: "Tickets", value: recentTickets.length },
    { label: "Appels", value: recentCalls.length },
  ];
  const maxActivity = Math.max(...activityData.map((d) => d.value), 1);

  // Classe de base homogène pour toutes les cartes
  const baseCardClass =
    "rounded-2xl border border-slate-200/70 bg-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)] " +
    "backdrop-blur-lg dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-[0_18px_55px_rgba(0,0,0,0.65)]";

  // 🔥 MAIN corrigé : fond uniforme, plus de bordure globale
  return (
    <main className="flex min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* halos de fond */}
      <div className="pointer-events-none fixed inset-0 opacity-60 dark:opacity-70">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/40 via-sky-400/30 to-violet-500/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-500/20 via-emerald-400/10 to-indigo-500/25 blur-3xl" />
      </div>

      {/* section : padding mais pas de gros cadre */}
      <section className="relative z-10 flex flex-1 flex-col px-6 py-6 space-y-8">
        {/* Header + infos utilisateur + bouton thème */}
        <div className="flex items-center justify-between gap-6">
          {/* À gauche : titre / header */}
          <Header />

          {/* À droite : agence + avatar + thème */}
          <div className="flex items-center gap-5">
            {/* Bloc infos agence */}
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Agence Demo
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Utilisateur connecté
              </span>
            </div>

            {/* Avatar rond */}
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center 
                    font-semibold shadow-lg text-lg select-none">
              R
            </div>

            {/* Bouton thème */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-slate-200 bg-white/80 shadow-sm 
                 hover:shadow-md hover:bg-slate-100 transition
                 dark:border-slate-700 dark:bg-slate-900/90 dark:hover:bg-slate-800"
              aria-label="Basculer le thème"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-300 transition-transform duration-300 rotate-0" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 -rotate-12" />
              )}
            </button>
          </div>
        </div>

        {/* Contenu animé global */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-10 pb-10"
        >
          {/* Stats globales */}
          <StatsCards />

          {/* -------------------------------------- */}
          {/*   LIGNE 1 : MESSAGES → APPELS → TICKETS */}
          {/* -------------------------------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* MESSAGES */}
            <motion.div
              {...cardHover}
              className="xl:col-span-2 cursor-pointer"
              onClick={() => router.push("/messages")}
            >
              <Card className={`p-6 ${baseCardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-violet-500 text-white shadow-md">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Messages</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Derniers échanges clients & IA
                      </p>
                    </div>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-300 text-xs font-medium hover:underline">
                    Voir tous
                  </span>
                </div>

                <div className="h-0.5 w-24 mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500" />

                {recentMessages.length === 0 ? (
                  <p className="text-slate-400 italic text-sm">
                    Aucun message pour l’instant.
                  </p>
                ) : (
                  <div className="rounded-xl border border-slate-100/60 dark:border-slate-800/80 overflow-hidden bg-white/70 dark:bg-slate-950/40">
                    <table className="w-full text-sm">
                      <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-900/60">
                        <tr>
                          <th className="py-2.5 pl-4 text-left font-medium">
                            Expéditeur
                          </th>
                          <th className="py-2.5 text-left font-medium">
                            Message
                          </th>
                          <th className="py-2.5 pr-4 text-right font-medium">
                            Heure
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMessages.slice(0, 6).map((m) => (
                          <tr
                            key={m.id}
                            className="border-b last:border-b-0 border-slate-100/70 dark:border-slate-800/70 hover:bg-indigo-50/70 dark:hover:bg-slate-900/80 transition"
                          >
                            <td className="py-2.5 pl-4 font-semibold text-slate-800 dark:text-slate-100">
                              {m.role === "assistant" ? "IA" : "Client"}
                            </td>
                            <td className="py-2.5 pr-4 truncate max-w-[420px] text-slate-700 dark:text-slate-200">
                              {m.content}
                            </td>
                            <td className="py-2.5 pr-4 text-slate-400 dark:text-slate-500 text-right text-xs">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* APPELS + TICKETS empilés */}
            <div className="space-y-6">
              {/* APPELS */}
              <motion.div
                {...cardHover}
                className="cursor-pointer"
                onClick={() => router.push("/appels")}
              >
                <Card className={`p-4 ${baseCardClass}`}>
                  <div className="flex items-center justify_between mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-teal-400 text-white shadow-md">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold">Appels</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Derniers appels entrants / sortants
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-300 text-[11px] font-medium hover:underline">
                      Voir tous
                    </span>
                  </div>

                  <div className="h-0.5 w-16 mb-3 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-teal-400" />

                  {recentCalls.length === 0 ? (
                    <p className="text-slate-400 italic text-xs">
                      Aucun appel.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {recentCalls.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100/70 dark:border-slate-800/80"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 dark:text-slate-100">
                              {c.caller_name || c.from || "Inconnu"}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                              {c.direction === "inbound"
                                ? "Appel entrant"
                                : "Appel sortant"}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {new Date(c.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </motion.div>

              {/* TICKETS */}
              <motion.div
                {...cardHover}
                className="cursor-pointer"
                onClick={() => router.push("/tickets")}
              >
                <Card className={`p-4 ${baseCardClass}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-400 to-rose-400 text-white shadow-md">
                        <TicketIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold">Tickets</h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Suivi des demandes et incidents
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/tickets/new"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[11px] font-medium hover:bg-indigo-700 transition"
                    >
                      + Nouveau
                    </Link>
                  </div>

                  <div className="h-0.5 w-16 mb-3 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400" />

                  {recentTickets.length === 0 ? (
                    <p className="text-slate-400 italic text-xs">
                      Aucun ticket.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {recentTickets.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100/70 dark:border-slate-800/80"
                        >
                          <div className="flex flex-col max-w-[140px]">
                            <span className="font-medium truncate text-slate-800 dark:text-slate-100">
                              {t.title}
                            </span>
                            <span
                              className={`mt-1 inline-flex items-center rounded-full px-2 py-[1px] text-[10px] font-medium ${statusBadgeColor(
                                t.status
                              )}`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {new Date(t.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>

          {/* -------------------------------------- */}
          {/*   LIGNE 2 : CALENDRIER + COLONNE IA    */}
          {/* -------------------------------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendrier semaine */}
            <motion.div {...cardHover} className="xl:col-span-2">
              <Card className={`p-6 ${baseCardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white shadow-md">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">
                        Calendrier – Vue semaine
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Rendez-vous, visites, appels planifiés
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/calendrier")}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline"
                  >
                    Ouvrir le calendrier
                  </button>
                </div>

                <div className="h-0.5 w-24 mb-4 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500" />

                {/* style type Apple Calendar simplifié */}
                <div className="rounded-2xl border border-slate-100/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 overflow-hidden">
                  <div className="grid grid-cols-7 bg-slate-50/90 dark:bg-slate-900/80 text-xs">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                      (day, i) => (
                        <div
                          key={i}
                          className="border-r last:border-r-0 border-slate-100 dark:border-slate-800 px-3 py-2 text-center font-medium text-slate-600 dark:text-slate-200"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>
                  <div className="h-56 bg-gradient-to-b from-white/90 to-slate-50/80 dark:from-slate-950/60 dark:to-slate-900/80" />
                </div>
              </Card>
            </motion.div>

            {/* Colonne IA : contact + assistant + actions rapides */}
            <div className="space-y-4">
              {/* Nouveau contact */}
              <motion.div {...cardHover}>
                <Card className={`p-5 ${baseCardClass}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white shadow-md">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        Nouveau contact rapide
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ajoute un lead en quelques secondes.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleAddQuickContact}
                    className="space-y-2 text-sm"
                  >
                    <input
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white/90 text-slate-900
                                 focus:outline-none focus:ring-2 focus:ring-pink-200/70
                                 dark:bg-slate-950/60 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-pink-500/40"
                      placeholder="Nom complet *"
                      value={newContact.full_name}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          full_name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white/90 text-slate-900
                                 focus:outline-none focus:ring-2 focus:ring-pink-200/70
                                 dark:bg-slate-950/60 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-pink-500/40"
                      placeholder="Email"
                      value={newContact.email}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          email: e.target.value,
                        })
                      }
                    />
                    <input
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white/90 text-slate-900
                                 focus:outline-none focus:ring-2 focus:ring-pink-200/70
                                 dark:bg-slate-950/60 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-pink-500/40"
                      placeholder="Téléphone"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          phone: e.target.value,
                        })
                      }
                    />

                    <button
                      type="submit"
                      disabled={isSavingContact}
                      className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold
                                 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white
                                 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-default"
                    >
                      {isSavingContact
                        ? "Ajout en cours..."
                        : "Ajouter le contact"}
                    </button>
                  </form>
                </Card>
              </motion.div>

              {/* Assistant IA recherche rapide */}
              <motion.div {...cardHover}>
                <Card className={`p-5 ${baseCardClass}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        Assistant IA – recherche rapide
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pose une question sur un locataire, un ticket, un bien…
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleAssistantSearch}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white/90
                                    focus-within:ring-2 focus-within:ring-violet-200/70
                                    dark:bg-slate-950/60 dark:border-slate-700 dark:focus-within:ring-violet-500/40">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        className="flex-1 outline-none text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-xs"
                        placeholder="Ex : locataire en retard de paiement"
                        value={assistantQuery}
                        onChange={(e) => setAssistantQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 text-white text-xs font-semibold hover:brightness-110 active:scale-[0.98] transition"
                    >
                      Rechercher
                    </button>
                  </form>

                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    L’IA recherche dans les conversations, tickets et contacts
                    selon ta configuration.
                  </p>
                </Card>
              </motion.div>

              {/* Actions rapides IALynk */}
              <motion.div {...cardHover}>
                <Card
                  className={
                    "p-4 rounded-2xl border shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50"
                  }
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-2xl bg-slate-800/90 text-slate-100">
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        Actions rapides IALynk
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Gagne du temps sur tes gestes du quotidien.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => router.push("/assistant")}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-left transition"
                    >
                      <Bot className="w-4 h-4 text-sky-300" />
                      <span>Ouvrir Assistant IA</span>
                    </button>
                    <button
                      onClick={() => router.push("/tickets/new")}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-left transition"
                    >
                      <TicketIcon className="w-4 h-4 text-emerald-300" />
                      <span>Nouveau ticket</span>
                    </button>
                    <button
                      onClick={() => router.push("/contacts")}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-left transition"
                    >
                      <Users className="w-4 h-4 text-purple-300" />
                      <span>Voir contacts</span>
                    </button>
                    <button
                      onClick={() => router.push("/appels")}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-left transition"
                    >
                      <Phone className="w-4 h-4 text-amber-300" />
                      <span>Journal d’appels</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* -------------------------------------- */}
          {/*        LIGNE 3 : GRAPHIQUE + STATS IA  */}
          {/* -------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique d’activité */}
            <motion.div {...cardHover}>
              <Card className={`p-6 ${baseCardClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 text-white shadow-md">
                      <ActivityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">
                        Activité récente (vue synthèse)
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Messages, tickets et appels sur la période récente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-5 h-40 pt-2">
                  {activityData.map((item) => (
                    <div
                      key={item.label}
                      className="flex-1 flex flex-col items-center justify-end gap-1.5"
                    >
                      <div className="w-10 rounded-full bg-slate-100 dark:bg-slate-900/80 overflow-hidden flex items-end shadow-inner">
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-indigo-500 via-sky-500 to-teal-400 transition-all"
                          style={{
                            height: `${Math.max(
                              8,
                              (item.value / maxActivity) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 text-center">
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Stats IA & barres colorées */}
            <motion.div {...cardHover}>
              <Card className={`p-6 ${baseCardClass}`}>
                <h2 className="text-lg font-semibold mb-4">
                  IA IALynk – performances
                </h2>

                <div className="space-y-4 text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 dark:text-slate-300">
                        Taux de réponses IA
                      </span>
                      <span className="font-semibold">
                        {iaResponseRate}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${iaResponseRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 dark:text-slate-300">
                        Indice d’automatisation
                      </span>
                      <span className="font-semibold">
                        {automationIndex}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-yellow-300 transition-all"
                        style={{ width: `${automationIndex}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <p className="text-[11px] uppercase tracking-wide mb-1">
                        Réponses IA
                      </p>
                      <p className="text-lg font-semibold">{iaReplies}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <p className="text-[11px] uppercase tracking-wide mb-1">
                        Messages clients
                      </p>
                      <p className="text-lg font-semibold">
                        {humanMessages}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                      <p className="text-[11px] uppercase tracking-wide mb-1">
                        Tickets suivis
                      </p>
                      <p className="text-lg font-semibold">
                        {recentTickets.length}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Ces métriques se basent sur les dernières activités
                    enregistrées (messages, appels, tickets). Parfait pour
                    suivre l’efficacité de ton IA IALynk, comme sur EliseAI
                    mais en version française.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
