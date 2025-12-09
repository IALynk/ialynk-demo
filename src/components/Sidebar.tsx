"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Home,
  MessageSquare,
  Bot,
  Users,
  Settings,
  Search,
  Ticket,
  LogOut,
  PhoneCall,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";

// 🔥 Connexion Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Sidebar() {
  const pathname = usePathname();

  // État ouverture / fermeture
  const [open, setOpen] = useState(true);

  const menuItems = [
    { icon: Home, label: "Tableau de bord", href: "/dashboard" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Ticket, label: "Tickets", href: "/tickets" },
    { icon: Bot, label: "Assistant IA", href: "/assistant" },
    { icon: Users, label: "Contacts", href: "/contacts" },
    { icon: PhoneCall, label: "Appels", href: "/appels" },
    { icon: CalendarDays, label: "Calendrier", href: "/calendrier" },
    { icon: Settings, label: "Réglages", href: "/reglages" },
    { icon: Search, label: "Recherche", href: "/recherche" },
  ];

  // 🔥 Fonction déconnexion animée
  const handleLogout = async () => {
    // Lance l'animation
    document.body.classList.add("logout-anim");

    // Déconnexion Supabase
    await supabase.auth.signOut();

    // Attendre fin animation (600ms)
    setTimeout(() => {
      window.location.href = "/login";
    }, 600);
  };

  return (
    <>
      {/* ░░░ BOUTON FLOTTANT quand la sidebar est fermée ░░░ */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed top-4 left-4 z-50 p-3 rounded-2xl
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            shadow-2xl border border-slate-200 dark:border-slate-700
            hover:scale-105 active:scale-95 transition-all
          "
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
      )}

      {/* ░░░ SIDEBAR ░░░ */}
      <aside
        className={`
          sticky top-4 z-40 transition-all duration-300
          ${open ? "w-64" : "w-0 overflow-hidden"}
        `}
      >
        <div
          className={`
            h-[calc(100vh-2rem)]
            mx-3 rounded-3xl
            bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl
            shadow-2xl border border-slate-200 dark:border-slate-800
            flex flex-col justify-between
            transition-all duration-300
            ${open ? "opacity-100" : "opacity-0"}
          `}
        >
          {/* ░░░ HEADER SIDEBAR + BOUTON FERMETURE ░░░ */}
          <div className="flex items-center justify-between px-6 py-5">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
              IALynk
            </h1>

            <button
              onClick={() => setOpen(false)}
              className="
                p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
                transition active:scale-95
              "
            >
              <X className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
          </div>

          {/* ░░░ MENU ░░░ */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {menuItems.map(({ icon: Icon, label, href }) => {
              const isActive = pathname === href;

              return (
                <Link key={label} href={href}>
                  <button
                    className={`
                      flex items-center w-full px-4 py-3 rounded-xl transition-all
                      ${isActive
                        ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"}
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 ${
                        isActive ? "text-white" : "text-indigo-500 dark:text-indigo-300"
                      }`}
                    />
                    {label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* ░░░ DÉCONNEXION AVEC ANIMATION ░░░ */}
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-4 text-gray-500 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
