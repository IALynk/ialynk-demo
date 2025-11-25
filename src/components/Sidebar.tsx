"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Bot,
  Users,
  Settings,
  Search,
  Ticket,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Tableau de bord", href: "/dashboard" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Ticket, label: "Tickets", href: "/tickets" },
    { icon: Bot, label: "Assistant IA", href: "/assistant" },
    { icon: Users, label: "Contacts", href: "/contacts" },
    { icon: Settings, label: "Réglages", href: "/reglages" },
    { icon: Search, label: "Recherche", href: "/recherche" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4 min-h-screen">
      <div>
        <h1 className="text-xl font-bold mb-6 text-blue-600">IALynk</h1>

        <nav className="space-y-2">
          {menuItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href;

            return (
              <Link key={label} href={href}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "text-blue-600" : "text-blue-600"
                    }`}
                  />
                  {label}
                </button>
              </Link>
            );
          })}
        </nav>
      </div>

      <button className="flex items-center text-gray-500 hover:text-red-600 mt-6">
        <LogOut className="w-5 h-5 mr-2" />
        Déconnexion
      </button>
    </aside>
  );
}
