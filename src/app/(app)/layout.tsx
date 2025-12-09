// src/app/(app)/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar toujours visible dans la section (app) */}
      <Sidebar />

      {/* Contenu de page */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
