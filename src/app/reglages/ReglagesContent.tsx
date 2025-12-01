"use client";

import { useSearchParams, useRouter } from "next/navigation";

import TabsBar from "@/components/settings/TabsBar";
import ProfileTab from "@/components/settings/ProfileTab";
import AgencyTab from "@/components/settings/AgencyTab";
import AIAssistantTab from "@/components/settings/AIAssistantTab";
import TelephonyTab from "@/components/settings/TelephonyTab";
import SecurityTab from "@/components/settings/SecurityTab";

export default function ReglagesContent() {
  return <ReglagesContentInner />;
}

function ReglagesContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab") || "profil";
  const validTabs = ["profil", "agence", "ia", "telephonie", "securite"];

  // 🔥 Empêche un rendu infini si tab est invalide
  if (!validTabs.includes(tab)) {
    router.replace("/reglages?tab=profil");
    return null; // ← très important pour éviter l'affichage vide
  }

  return (
    <main className="p-8 min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition mb-4"
      >
        Retour
      </button>

      <h1 className="text-3xl font-bold mb-8">Réglages</h1>

      <TabsBar active={tab} />

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
