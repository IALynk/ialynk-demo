"use client";

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

// ⭐ Composant complet
export function StatsCards() {
  const stats = [
    {
      label: "Messages aujourd'hui",
      value: 24,
      href: "/messages",
      icon: MessageSquareText,
      chartColor: "#2563eb",
      data: [2, 3, 5, 4, 8, 10, 12, 24],
    },
    {
      label: "Appels reçus",
      value: 5,
      href: "/messages",
      icon: PhoneCall,
      chartColor: "#16a34a",
      data: [0, 1, 1, 3, 2, 5],
    },
    {
      label: "Tickets ouverts",
      value: 3,
      href: "/tickets",
      icon: Ticket,
      chartColor: "#f59e0b",
      data: [1, 1, 2, 2, 3],
    },
    {
      label: "Réponses IA",
      value: "92%",
      href: "/assistant",
      icon: Bot,
      chartColor: "#9333ea",
      data: [60, 70, 75, 80, 85, 90, 92],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        const chartData = item.data.map((v, i) => ({
          name: i,
          value: v,
        }));

        return (
          <Link key={item.label} href={item.href} className="block">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 240 }}
              className="
                bg-white rounded-2xl shadow-sm p-5 border border-gray-100
                cursor-pointer hover:shadow-md transition
              "
            >
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Icon className="w-7 h-7 text-blue-600" />
                </motion.div>

                <p className="text-2xl font-bold text-blue-600">
                  {item.value}
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-2">{item.label}</p>

              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={item.chartColor}
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
  );
}
