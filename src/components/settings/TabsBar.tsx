"use client";

import Link from "next/link";
import {
  User,
  Building,
  Bot,
  Phone,
  Lock,
} from "lucide-react";

export default function TabsBar({ active }: { active: string }) {
  const tabs = [
    {
      id: "profil",
      label: "Profil",
      icon: <User size={18} />,
    },
    {
      id: "agence",
      label: "Agence",
      icon: <Building size={18} />,
    },
    {
      id: "ia",
      label: "Assistant IA",
      icon: <Bot size={18} />,
    },
    {
      id: "telephonie",
      label: "Téléphonie",
      icon: <Phone size={18} />,
    },
    {
      id: "securite",
      label: "Sécurité",
      icon: <Lock size={18} />,
    },
  ];

  return (
    <div className="flex gap-6 border-b border-gray-300 dark:border-neutral-700 pb-2 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/reglages?tab=${tab.id}`}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition ${
            active === tab.id
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {tab.icon}
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
