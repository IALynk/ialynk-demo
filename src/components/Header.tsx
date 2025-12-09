"use client";

export function Header() {
  return (
    <header className="flex flex-col">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Tableau de bord
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Vue d’ensemble de votre activité IALynk
      </p>
    </header>
  );
}
