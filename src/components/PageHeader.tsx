"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PageHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Flèche retour + titre */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h1>
      </div>

      {/* Barre de recherche */}
      <div className="w-64">
        <Input
          type="search"
          placeholder="Rechercher..."
          className="w-full"
        />
      </div>
    </div>
  );
}
