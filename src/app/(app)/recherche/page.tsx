"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  ChevronLeft,
  Mail,
  User,
  Phone,
  Ticket,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GlobalSearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // ------------------------------------
  // 🔍 Fonction centrale : rechercher
  // ------------------------------------
  const performSearch = async () => {
    if (!query || query.trim().length === 0) return;

    setLoading(true);
    const out: any[] = [];

    // Contacts
    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

    contacts?.forEach((c) =>
      out.push({
        type: "Contact",
        title: c.full_name,
        content: c.email || c.phone,
        icon: User,
        path: `/contacts/${c.id}`,
      })
    );

    // Messages
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .ilike("content", `%${query}%`);

    messages?.forEach((m) =>
      out.push({
        type: "Message",
        title: m.role,
        content: m.content,
        icon: Mail,
        path: `/messages/${m.id}`,
      })
    );

    // Tickets
    const { data: tickets } = await supabase
      .from("tickets")
      .select("*")
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,status.ilike.%${query}%`
      );

    tickets?.forEach((t) =>
      out.push({
        type: "Ticket",
        title: t.title,
        content: t.description,
        icon: Ticket,
        path: `/tickets/${t.id}`,
      })
    );

    // Appels
    const { data: calls } = await supabase
      .from("calls")
      .select("*")
      .or(
        `from_number.ilike.%${query}%,to_number.ilike.%${query}%,direction.ilike.%${query}%`
      );

    calls?.forEach((c) =>
      out.push({
        type: "Appel",
        title: c.direction === "inbound" ? "Appel entrant" : "Appel sortant",
        content: `De ${c.from_number} → ${c.to_number}`,
        icon: Phone,
        path: `/appels/${c.id}`,
      })
    );

    // Calendrier
    const { data: events } = await supabase
      .from("calendar")
      .select("*")
      .or(
        `title.ilike.%${query}%,notes.ilike.%${query}%,contact_name.ilike.%${query}%`
      );

    events?.forEach((e) =>
      out.push({
        type: "Événement",
        title: e.title,
        content: `${e.start_time}`,
        icon: Calendar,
        path: `/calendrier?event=${e.id}`,
      })
    );

    setResults(out);
    setLoading(false);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-start pt-32">

      {/* 🔙 FLÈCHE DE RETOUR */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition"
      >
        <ChevronLeft size={22} />
        <span>Retour</span>
      </button>

      {/* 🌟 BLOC CENTRÉ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center w-full max-w-2xl"
      >
        {/* 🔍 GROS BOUTON LOUPE (clic = recherche) */}
        <motion.button
          onClick={performSearch}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl cursor-pointer"
        >
          <Search size={38} />
        </motion.button>

        {/* ✏️ INPUT DE RECHERCHE */}
        <input  
          type="text"
          value={query}
          placeholder="Je recherche…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              performSearch();
            }
          }}
          className="
            w-full py-4 px-6 text-lg rounded-2xl border
            bg-white dark:bg-neutral-900
            shadow-xl outline-none transition
            focus:ring-4 ring-indigo-300 dark:ring-indigo-900
          "
        />
      </motion.div>

      {/* 🔎 RÉSULTATS */}
      <div className="mt-10 w-full max-w-3xl">
        <AnimatePresence>
          {results.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Link
                  href={item.path}
                  className="block p-5 mb-3 rounded-xl border bg-white dark:bg-neutral-900 shadow hover:shadow-xl transition hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                      <Icon size={22} />
                    </div>

                    <div>
                      <p className="font-semibold">{item.type} – {item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Aucun résultat */}
        {!loading && results.length === 0 && query.length > 2 && (
          <p className="text-center text-gray-500 mt-6">
            Aucun résultat trouvé…
          </p>
        )}
      </div>
    </div>
  );
}
