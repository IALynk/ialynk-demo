"use client";

import { Lock, ShieldCheck, Smartphone, History } from "lucide-react";

export default function SecuriteSettings() {
  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-xl font-semibold">Sécurité</h2>

      {/* Activer 2FA */}
      <Section
        icon={ShieldCheck}
        title="Authentification à deux facteurs"
        description="Ajoutez une couche de protection supplémentaire à votre compte."
        button="Activer la 2FA"
      />

      {/* Appareils connectés */}
      <Section
        icon={Smartphone}
        title="Appareils connectés"
        description="Gérez les appareils ayant accès à votre compte."
        button="Voir les appareils"
      />

      {/* Historique */}
      <Section
        icon={History}
        title="Historique de connexion"
        description="Consultez les connexions récentes à votre compte."
        button="Afficher l’historique"
      />
    </div>
  );
}

function Section({ icon: Icon, title, description, button }: any) {
  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <p className="text-gray-600 mt-1">{description}</p>

      <button className="mt-3 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
        {button}
      </button>
    </div>
  );
}
