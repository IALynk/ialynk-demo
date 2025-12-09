"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  PhoneIncoming,
  PhoneOutgoing,
  Filter,
  ArrowLeft,
  Trash2,
  Archive,
  Star,
  CheckCircle,
} from "lucide-react";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AppelsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("today");

  // Charger données
  useEffect(() => {
    loadCalls();
  }, []);

  async function loadCalls() {
    const { data, error } = await supabase
      .from("Calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setCalls(data || []);
  }

  // Filtrage
  function filteredCalls() {
    return calls.filter((c) => {
      const matchType =
        filterType === "all" ||
        (filterType === "entrant" && c.direction === "inbound") ||
        (filterType === "sortant" && c.direction === "outbound");

      const matchStatus = filterStatus === "all" || filterStatus === c.status;

      const matchDate =
        filterDate === "today"
          ? new Date(c.created_at).toDateString() ===
            new Date().toDateString()
          : true;

      return matchType && matchStatus && matchDate;
    });
  }

  // Stats
  const stats = {
    total: calls.length,
    entrants: calls.filter((c) => c.direction === "inbound").length,
    sortants: calls.filter((c) => c.direction === "outbound").length,
    averageDuration:
      calls.length > 0
        ? Math.round(
            calls.reduce((a, c) => a + (c.duration || 0), 0) / calls.length
          )
        : "-",
  };

  // --------------------------
  // 🔥 Swipe Action intégré
  // --------------------------
  function SwipeRow({ children, onDelete, onArchive, onImportant, onDone }) {
    const x = useMotionValue(0);
    const threshold = 80;

    return (
      <div className="relative w-full overflow-hidden">
        {/* Zone Delete */}
        <div className="absolute right-0 top-0 h-full w-28 bg-red-500 flex items-center justify-center text-white">
          <Trash2 size={22} />
        </div>

        {/* Zone Archive */}
        <div className="absolute left-0 top-0 h-full w-28 bg-gray-300 flex items-center justify-center text-black">
          <Archive size={22} />
        </div>

        {/* Zone Important */}
        <div className="absolute right-28 top-0 h-full w-28 bg-yellow-400 flex items-center justify-center text-black">
          <Star size={22} />
        </div>

        {/* Zone Traité */}
        <div className="absolute left-28 top-0 h-full w-28 bg-green-500 flex items-center justify-center text-white">
          <CheckCircle size={22} />
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -160, right: 160 }}
          style={{ x }}
          transition={{ bounceStiffness: 1200, bounceDamping: 20 }}
          onDragEnd={() => {
            if (x.get() < -130) onDelete?.();
            else if (x.get() < -50) onImportant?.();
            else if (x.get() > 130) onArchive?.();
            else if (x.get() > 50) onDone?.();

            // Retour rebond iOS
            x.set(0);
          }}
          className="bg-white"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full"
    >
      {/* -------------------------------------- */}
      {/* 🔥 HEADER iOS */}
      {/* -------------------------------------- */}
      <div
        className="
          sticky top-0 z-40
          backdrop-blur-xl bg-white/70
          border-b border-gray-200
          px-10 pb-4 pt-6
        "
      >
        <button
          onClick={() => window.history.back()}
          className="
            inline-flex items-center gap-1
            px-4 py-2
            rounded-full bg-gray-100 hover:bg-gray-200
          "
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <h1 className="text-4xl font-semibold mt-3 tracking-tight">Appels</h1>
      </div>

      <div className="px-10 pt-6 space-y-8">

        {/* -------------------------------------- */}
        {/* 📊 Statistiques */}
        {/* -------------------------------------- */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: "Total appels", val: stats.total },
            { label: "Entrants", val: stats.entrants, color: "text-green-600" },
            { label: "Sortants", val: stats.sortants, color: "text-purple-600" },
            {
              label: "Durée moyenne",
              val:
                stats.averageDuration === "-"
                  ? "-"
                  : stats.averageDuration + "s",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-gray-100 shadow-sm"
            >
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-3xl font-semibold mt-2 ${s.color || ""}`}>
                {s.val}
              </p>
            </div>
          ))}
        </div>

        {/* -------------------------------------- */}
        {/* 🎚️ Filtres */}
        {/* -------------------------------------- */}
        <div className="w-full bg-white border border-gray-200 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter size={18} />
            <span className="font-medium">Filtres</span>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            {/* TYPE */}
            {[
              { id: "all", label: "Tous" },
              { id: "entrant", label: "Entrants" },
              { id: "sortant", label: "Sortants" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-4 py-1 rounded-full text-sm ${
                  filterType === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* STATUS */}
            {[
              { id: "all", label: "Tous statuts" },
              { id: "completed", label: "Terminés" },
              { id: "missed", label: "Manqués" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-4 py-1 rounded-full text-sm ${
                  filterStatus === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* DATE */}
            {[
              { id: "today", label: "Aujourd’hui" },
              { id: "7days", label: "7 jours" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterDate(f.id)}
                className={`px-4 py-1 rounded-full text-sm ${
                  filterDate === f.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* -------------------------------------- */}
        {/* 📱 Liste d’appels avec SWIPE iOS */}
        {/* -------------------------------------- */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          {filteredCalls().length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Aucun appel trouvé.
            </p>
          ) : (
            filteredCalls().map((call) => (
              <SwipeRow
                key={call.id}
                onDelete={() => console.log("DELETE", call.id)}
                onArchive={() => console.log("ARCHIVE", call.id)}
                onImportant={() => console.log("IMPORTANT", call.id)}
                onDone={() => console.log("DONE", call.id)}
              >
                <Link
                  href={`/appels/${call.id}`}
                  className="
                    flex items-center justify-between
                    px-6 py-4 border-b last:border-none
                    hover:bg-gray-50 transition
                  "
                >
                  <div className="flex items-center gap-3">
                    {call.direction === "inbound" ? (
                      <PhoneIncoming className="text-green-500" />
                    ) : (
                      <PhoneOutgoing className="text-purple-500" />
                    )}

                    <div>
                      <p className="font-medium text-gray-900">
                        {call.contact_name || call.from_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {call.direction === "inbound"
                          ? "Appel reçu"
                          : "Appel émis"}{" "}
                        • {call.from_number} → {call.to_number}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-500 text-sm">
                    {new Date(call.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Link>
              </SwipeRow>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
