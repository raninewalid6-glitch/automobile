import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign, Eye, Filter, Search, ShoppingCart, WalletCards } from "lucide-react";
import { adminPurchases, purchaseStatusLabels, purchaseStatusStyles, purchaseStatuses } from "../mock/adminPurchases.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const initialFilters = {
  search: "",
  status: "all",
  city: "all",
  owner: "all",
};

function uniquePurchaseValues(selector) {
  return [...new Set(adminPurchases.map(selector).filter(Boolean))].sort();
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${purchaseStatusStyles[status] ?? purchaseStatusStyles.PENDING}`}>
      {purchaseStatusLabels[status] ?? status}
    </span>
  );
}

function formatDateTime(value) {
  return dateFormatter.format(new Date(value));
}

export default function PurchasesPage() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredPurchases = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return adminPurchases.filter((purchase) => {
      const matchesSearch = !searchValue || [purchase.id, purchase.client.name, purchase.client.phone, purchase.car.title, purchase.car.plateNumber, purchase.owner.name, purchase.paymentMethod]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesStatus = filters.status === "all" || purchase.status === filters.status;
      const matchesCity = filters.city === "all" || purchase.car.city === filters.city || purchase.client.city === filters.city || purchase.owner.city === filters.city;
      const matchesOwner = filters.owner === "all" || purchase.owner.name === filters.owner;

      return matchesSearch && matchesStatus && matchesCity && matchesOwner;
    });
  }, [filters]);

  const totals = filteredPurchases.reduce((accumulator, purchase) => {
    const commissionAmount = Math.round((purchase.salePrice * purchase.commissionRate) / 100);

    return {
      amount: accumulator.amount + purchase.salePrice,
      commission: accumulator.commission + commissionAmount,
      completed: accumulator.completed + (purchase.status === "COMPLETED" ? 1 : 0),
    };
  }, { amount: 0, commission: 0, completed: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion demandes d'achat mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Demandes d'achat voitures</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Suivez les intentions d'achat, le client, le véhicule, l'owner et les statuts de vente avec des données mock uniquement.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
            <ShoppingCart className="h-6 w-6" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">Total filtré</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredPurchases.length} demandes</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Valeur ventes</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.amount)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Commission estimée</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.commission)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ventes complétées</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{totals.completed}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          Filtres achats
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              placeholder="Rechercher ID, client, voiture, owner..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">Tous statuts</option>
            {purchaseStatuses.map((status) => <option key={status} value={status}>{purchaseStatusLabels[status]}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">Toutes villes</option>
            {uniquePurchaseValues((purchase) => purchase.car.city).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.owner} onChange={(event) => handleFilterChange("owner", event.target.value)}>
            <option value="all">Tous owners</option>
            {uniquePurchaseValues((purchase) => purchase.owner.name).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-4 font-semibold">Purchase ID</th>
                <th className="py-4 font-semibold">Client</th>
                <th className="py-4 font-semibold">Voiture</th>
                <th className="py-4 font-semibold">Owner</th>
                <th className="py-4 font-semibold">Sale price</th>
                <th className="py-4 font-semibold">Statut</th>
                <th className="py-4 font-semibold">Créée le</th>
                <th className="py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4 font-black text-gray-900 dark:text-white">{purchase.id}</td>
                  <td className="py-4">
                    <p className="font-bold text-gray-900 dark:text-white">{purchase.client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.client.city} · {purchase.client.phone}</p>
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{purchase.car.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.car.city} · {purchase.car.plateNumber}</p>
                  </td>
                  <td className="py-4">{purchase.owner.name}</td>
                  <td className="py-4">
                    <p className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(purchase.salePrice)}</p>
                    <p className="inline-flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300"><WalletCards className="h-3 w-3" />{purchase.paymentMethod}</p>
                  </td>
                  <td className="py-4"><StatusBadge status={purchase.status} /></td>
                  <td className="py-4">{formatDateTime(purchase.createdAt)}</td>
                  <td className="py-4 text-right">
                    <Link className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 font-bold text-gray-900 dark:text-white transition hover:border-red-500/50 hover:bg-red-500/10" to={`/admin/purchases/${purchase.id}`}>
                      <Eye className="h-4 w-4" /> Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPurchases.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucune demande d'achat ne correspond aux filtres.</div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <CircleDollarSign className="h-7 w-7 text-red-700 dark:text-red-200" />
          <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-100">Prix moyen filtré</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{filteredPurchases.length ? currencyFormatter.format(totals.amount / filteredPurchases.length) : currencyFormatter.format(0)}</p>
        </div>
        <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
          <ShoppingCart className="h-7 w-7 text-orange-700 dark:text-orange-200" />
          <p className="mt-3 text-sm font-semibold text-orange-700 dark:text-orange-100">Pipeline actif</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{filteredPurchases.filter((purchase) => ["PENDING", "ACCEPTED"].includes(purchase.status)).length} demandes</p>
        </div>
      </section>
    </div>
  );
}
