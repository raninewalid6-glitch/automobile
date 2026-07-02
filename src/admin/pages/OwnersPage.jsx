import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, Search, ShieldOff, UserRoundCheck, UsersRound } from "lucide-react";
import { adminOwners, ownerStatusLabels, ownerStatusStyles } from "../mock/adminOwners.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("fr-FR");

const initialFilters = {
  search: "",
  city: "all",
  status: "all",
  commission: "all",
};

function uniqueValues(key) {
  return [...new Set(adminOwners.map((owner) => owner[key]).filter(Boolean))].sort();
}

function OwnerStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${ownerStatusStyles[status] ?? ownerStatusStyles.inactive}`}>
      {ownerStatusLabels[status] ?? status}
    </span>
  );
}

export default function OwnersPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [owners, setOwners] = useState(adminOwners);

  const filteredOwners = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return owners.filter((owner) => {
      const matchesSearch = !searchValue || [owner.name, owner.phone, owner.email, owner.city, owner.manager]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesCity = filters.city === "all" || owner.city === filters.city;
      const matchesStatus = filters.status === "all" || owner.status === filters.status;
      const matchesCommission = filters.commission === "all" || (filters.commission === "due" ? owner.metrics.commissionDue > 0 : owner.metrics.commissionDue === 0);

      return matchesSearch && matchesCity && matchesStatus && matchesCommission;
    });
  }, [filters, owners]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleStatus = (ownerId) => {
    setOwners((currentOwners) => currentOwners.map((owner) => {
      if (owner.id !== ownerId) return owner;
      return { ...owner, status: owner.status === "active" ? "inactive" : "active" };
    }));
  };

  const totals = owners.reduce((accumulator, owner) => ({
    revenue: accumulator.revenue + owner.metrics.revenue,
    commissionDue: accumulator.commissionDue + owner.metrics.commissionDue,
    active: accumulator.active + (owner.status === "active" ? 1 : 0),
  }), { revenue: 0, commissionDue: 0, active: 0 });

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion propriétaires mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Propriétaires & partenaires</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Pilotez les profils propriétaires, leurs parcs voitures, réservations, ventes et commissions plateforme sans backend.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
            <UsersRound className="h-6 w-6" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">Total</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{owners.length} propriétaires</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Propriétaires actifs</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{totals.active}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenus consolidés</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.revenue)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Commission due</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.commissionDue)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Recherche nom, téléphone, email, ville..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">Toutes villes</option>
            {uniqueValues("city").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">Tous statuts</option>
            {Object.entries(ownerStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.commission} onChange={(event) => handleFilterChange("commission", event.target.value)}>
            <option value="all">Commissions: toutes</option>
            <option value="due">Commission due</option>
            <option value="clear">Aucune commission</option>
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-4 shadow-2xl shadow-black/25 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Propriétaires ({filteredOwners.length})</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Actions locales mock sans backend.</p>
          </div>
          <button className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => setFilters(initialFilters)}>
            Reset filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-4 font-semibold">Nom</th>
                <th className="py-4 font-semibold">Téléphone</th>
                <th className="py-4 font-semibold">Email</th>
                <th className="py-4 font-semibold">Ville</th>
                <th className="py-4 font-semibold">Voitures location</th>
                <th className="py-4 font-semibold">Voitures vente</th>
                <th className="py-4 font-semibold">Réservations</th>
                <th className="py-4 font-semibold">Ventes</th>
                <th className="py-4 font-semibold">Revenus</th>
                <th className="py-4 font-semibold">Commission due</th>
                <th className="py-4 font-semibold">Statut</th>
                <th className="py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.map((owner) => (
                <tr key={owner.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4">
                    <p className="font-bold text-gray-900 dark:text-white">{owner.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{owner.id} · {owner.manager}</p>
                  </td>
                  <td className="py-4">{owner.phone}</td>
                  <td className="py-4">{owner.email}</td>
                  <td className="py-4">{owner.city}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.rentalCars)}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.saleCars)}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.reservations)}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.sales)}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(owner.metrics.revenue)}</td>
                  <td className="py-4 font-semibold text-orange-700 dark:text-orange-200">{currencyFormatter.format(owner.metrics.commissionDue)}</td>
                  <td className="py-4"><OwnerStatusBadge status={owner.status} /></td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/owners/${owner.id}`} className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" title="Voir">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-emerald-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => toggleStatus(owner.id)} title="Activer/désactiver">
                        {owner.status === "active" ? <ShieldOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOwners.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <UserRoundCheck className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600" />
            <p className="mt-3 font-semibold">Aucun propriétaire ne correspond aux filtres.</p>
          </div>
        )}
      </section>
    </div>
  );
}
