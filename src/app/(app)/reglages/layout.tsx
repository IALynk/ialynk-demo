"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Bot,
  Phone,
  Lock,
  ArrowLeft,
} from "lucide-react";

export default function ReglagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Profil", href: "/reglages/profil", icon: User },
    { name: "Agence", href: "/reglages/agence", icon: Building2 },
    { name: "Assistant IA", href: "/reglages/assistant", icon: Bot },
    { name: "Téléphonie", href: "/reglages/telephonie", icon: Phone },
    { name: "Sécurité", href: "/reglages/securite", icon: Lock },
  ];

  return (
    <div className="p-6 animate-fadeIn">
      <Link href="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-6">Réglages</h1>

      {/* Onglets */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2
                ${active ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="mt-4">{children}</div>
    </div>
  );
}
