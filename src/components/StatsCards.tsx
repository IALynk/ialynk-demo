"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquareText,
  PhoneCall,
  Ticket,
  Bot,
} from "lucide-react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// -----------------------------------------
// 🔥 UTILITAIRES
// -----------------------------------------
function empty(size: number) {
  return Array.from({ length: size }, () => 0);
}

function getPeriodDates(period: string) {
  const start = new Date();

  if (period === "today") start.setHours(0, 0, 0, 0);
  if (period === "7d") start.setDate(start.getDate() - 7);
  if (period === "30d") start.setDate(start.getDate() - 30);

  return start.toISOString();
}

function computeTrendColor(values: number[], baseColor: string) {
  if (values.length < 2) return baseColor;

  const last = values[values.length - 1];
  const prev = values[values.length - 2];

  if (last > prev) return "#22c55e"; // green
  if (last < prev) return "#ef4444"; // red
  return baseColor; // neutral
}

// -----------------------------------------
// 🔥 COMPOSANT PRINCIPAL
// -----------------------------------------
export function StatsCards() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d">("today");

  const [messagesStats, setMessagesStats] = useState<number[]>(empty(24));
  const [callsStats, setCallsStats] = useState<number[]>(empty(24));
  const [ticketsStats, setTicketsStats] = useState<number[]>(empty(24));
  const [iaRate, setIaRate] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // LOAD STATS WHEN PERIOD CHANGES
  // -----------------------------------------
  useEffect(() => {
    loadAllStats();
  }, [period]);

  async function loadAllStats() {
    setLoading(true);

    await Promise.all([
      loadMessagesStats(),
      loadCallsStats(),
      loadTicketsStats(),
      loadIaRate(),
    ]);

    setLoading(false);
  }

  // -----------------------------------------
  // 📌 LOAD MESSAGES PER PERIOD
  // -----------------------------------------
  async function loadMessagesStats() {
    const periodStart = getPeriodDates(period);

    const { data } = await supabase
      .from("messages")
      .select("created_at")
      .gte("created_at", periodStart);

    const size = period === "today" ? 24 : period === "7d" ? 7 : 30;
    const stats = empty(size);

    data?.forEach((m) => {
      const date = new Date(m.created_at);
      const index =
        period === "today"
          ? date.getHours()
          : period === "7d"
          ? date.getDay()
          : date.getDate() - 1;
      stats[index]++;
    });

    setMessagesStats(stats);
  }

  // -----------------------------------------
  // 📌 LOAD CALLS
  // -----------------------------------------
  async function loadCallsStats() {
    const periodStart = getPeriodDates(period);

    const { data } = await supabase
      .from("calls")
      .select("created_at")
      .eq("direction", "inbound")
      .gte("created_at", periodStart);

    const size = period === "today" ? 24 : period === "7d" ? 7 : 30;
    const stats = empty(size);

    data?.forEach((c) => {
      const date = new Date(c.created_at);
      const index =
        period === "today"
          ? date.getHours()
          : period === "7d"
          ? date.getDay()
          : date.getDate() - 1;
      stats[index]++;
    });

    setCallsStats(stats);
  }

  // -----------------------------------------
  // 📌 LOAD TICKETS
  // -----------------------------------------
  async function loadTicketsStats() {
    const periodStart = getPeriodDates(period);

    const { data } = await supabase
      .from("tickets")
      .select("created_at")
      .gte("created_at", periodStart);

    const size = period === "today" ? 24 : period === "7d" ? 7 : 30;
    const stats = empty(size);

    data?.forEach((t) => {
      const date = new Date(t.created_at);
      const index =
        period === "today"
          ? date.getHours()
          : period === "7d"
          ? date.getDay()
          : date.getDate() - 1;
      stats[index]++;
    });

    setTicketsStats(stats);
  }

  // -----------------------------------------
  // 📌 LOAD IA RATE %
  // -----------------------------------------
  async function loadIaRate() {
    const periodStart = getPeriodDates(period);

    const { data } = await supabase
      .from("messages")
      .select("is_ai_response")
      .gte("created_at", periodStart);

    if (!data || data.length === 0) return setIaRate(0);

    const ai = data.filter((m) => m.is_ai_response).length;
    const rate = Math.round((ai / data.length) * 100);

    setIaRate(rate);
  }

  // -----------------------------------------
  // 📌 STATS CONFIG
  // -----------------------------------------
  const stats = [
    {
      label: "Messages",
      value: messagesStats.reduce((a, b) => a + b, 0),
      href: "/messages",
      icon: MessageSquareText,
      baseColor: "#2563eb",
      data: messagesStats,
    },
    {
      label: "Appels reçus",
      value: callsStats.reduce((a, b) => a + b, 0),
      href: "/appels", // ✅ redirection vers la bonne page
      icon: PhoneCall,
      baseColor: "#16a34a",
      data: callsStats,
    },
    {
      label: "Tickets ouverts",
      value: ticketsStats.reduce((a, b) => a + b, 0),
      href: "/tickets",
      icon: Ticket,
      baseColor: "#f59e0b",
      data: ticketsStats,
    },
    {
      label: "Réponses IA",
      value: iaRate + "%",
      href: "/assistant",
      icon: Bot,
      baseColor: "#9333ea",
      data: messagesStats,
    },
  ];

  return (
    <div className="space-y-4">
      {/* ⭐ SELECTEUR DE PERIODE */}
      <div className="flex gap-3">
        {[
          { id: "today", label: "Aujourd’hui" },
          { id: "7d", label: "7 jours" },
          { id: "30d", label: "30 jours" },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as any)}
            className={`
              px-3 py-1 rounded-lg text-sm border
              ${period === p.id ? "bg-blue-600 text-white" : "bg-white"}
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ⭐ CARTES DES STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          const chartData = item.data.map((v, i) => ({
            name: i,
            value: v,
          }));

          const dynamicColor = computeTrendColor(item.data, item.baseColor);

          return (
            <Link key={item.label} href={item.href} className="block">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-7 h-7 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? "…" : item.value}
                  </p>
                </div>

                <p className="text-sm text-gray-500 mb-2">{item.label}</p>

                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={dynamicColor}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
