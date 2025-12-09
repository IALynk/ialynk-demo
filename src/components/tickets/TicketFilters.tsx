"use client";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
};

export function TicketFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: Props) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <input
        className="border rounded-lg px-3 py-2 text-sm w-64"
        placeholder="Rechercher (titre, locataire, adresse...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="border rounded-lg px-3 py-2 text-sm"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">Tous les statuts</option>
        <option value="Nouvelle demande">Nouvelles demandes</option>
        <option value="En cours">En cours</option>
        <option value="Programmé">Programmés</option>
        <option value="Résolu">Résolus</option>
        <option value="Urgent">Urgents</option>
      </select>
    </div>
  );
}
