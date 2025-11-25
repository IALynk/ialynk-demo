"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import TabsBar from "@/components/settings/TabsBar";
import ProfileTab from "@/components/settings/ProfileTab";
import AgencyTab from "@/components/settings/AgencyTab";
import AIAssistantTab from "@/components/settings/AIAssistantTab";
import TelephonyTab from "@/components/settings/TelephonyTab";
import SecurityTab from "@/components/settings/SecurityTab";

export default function ReglagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab") || "profil";

  const validTabs = ["profil", "agence", "ia", "telephonie", "securite"];

  // Si tab invalide → redirection vers tab=profil
  useEffect(() => {
    if (!validTabs.includes(tab)) {
      router.replace("/reglages?tab=profil");
    }
  }, [tab, router, validTabs]);

  return (
    <main className="p-8 min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white">

      {/* Flèche retour vers le dashboard */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Retour au tableau de bord</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">Réglages</h1>

      {/* Barre d'onglets */}
      <TabsBar active={tab} />

      {/* Contenu de l'onglet sélectionné */}
      <div className="mt-10">
        {tab === "profil" && <ProfileTab />}
        {tab === "agence" && <AgencyTab />}
        {tab === "ia" && <AIAssistantTab />}
        {tab === "telephonie" && <TelephonyTab />}
        {tab === "securite" && <SecurityTab />}
      </div>

    </main>
  );
}
