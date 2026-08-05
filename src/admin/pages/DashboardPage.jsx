import React, { useEffect, useState } from "react";
import { Banknote, Car, CircleDollarSign, Clock3, HandCoins, KeyRound, ShoppingCart, UsersRound, WalletCards } from "lucide-react";
import KpiCard from "../components/KpiCard";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { bookingStatusLabels, bookingStatusStyles } from "../lib/bookingOptions";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

// Statuts possibles dans "Opérations récentes" (locations + achats)
const operationStatusLabels = {
  ...bookingStatusLabels,
  ACCEPTED: "Acceptée",
  REJECTED: "Rejetée",
};

const operationStatusStyles = {
  ...bookingStatusStyles,
  ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
};

function OperationBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${operationStatusStyles[status] ?? "border-gray-500/30 bg-gray-500/10 text-gray-600 dark:text-gray-300"}`}>
      {operationStatusLabels[status] ?? status}
    </span>
  );
}

export default function DashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/stats", { token })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement du dashboard...</p>
    );
  }

  const kpis = [
    {
      title: "Total voitures",
      value: stats.inventory.totalCars,
      icon: Car,
      helper: `${stats.inventory.activeCars} actives dans le catalogue`,
      tone: "red",
    },
    {
      title: "Voitures à louer",
      value: stats.inventory.carsForRent,
      icon: KeyRound,
      helper: "Disponibles pour réservations",
      tone: "orange",
    },
    {
      title: "Voitures à vendre",
      value: stats.inventory.carsForSale,
      icon: ShoppingCart,
      helper: "Catalogue vente actif",
      tone: "slate",
    },
    {
      title: "Réservations ce mois",
      value: stats.activity.reservationsThisMonth,
      icon: Clock3,
      helper: `${stats.activity.pendingBookings} en attente de confirmation`,
      tone: "red",
    },
    {
      title: "Demandes d'achat",
      value: stats.activity.purchaseRequests,
      icon: HandCoins,
      helper: "À qualifier par l'équipe admin",
      tone: "orange",
    },
    {
      title: "Clients inscrits",
      value: stats.activity.clients,
      icon: UsersRound,
      helper: "Comptes clients sur le site",
      tone: "slate",
    },
    {
      title: "Revenus location",
      value: currencyFormatter.format(stats.revenue.rentalRevenue),
      icon: WalletCards,
      helper: "Réservations confirmées et terminées",
      tone: "red",
    },
    {
      title: "Revenus vente",
      value: currencyFormatter.format(stats.revenue.salesRevenue),
      icon: Banknote,
      helper: "Ventes automobiles finalisées",
      tone: "orange",
    },
    {
      title: "Commission plateforme",
      value: currencyFormatter.format(stats.revenue.platformCommission),
      icon: CircleDollarSign,
      helper: `${currencyFormatter.format(stats.revenue.ownersAmount)} reversés aux owners`,
      tone: "slate",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Dashboard
            </p>
            
            
          </div>
          <div className="rounded-[1.5rem] border border-orange-500/20 bg-gradient-to-br from-red-600/20 to-orange-500/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-700 dark:text-orange-200">Revenu total</p>
            <p className="mt-4 text-4xl font-black text-gray-900 dark:text-white">
              {currencyFormatter.format(stats.revenue.rentalRevenue + stats.revenue.salesRevenue)}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Locations confirmées + ventes finalisées, mis à jour en temps réel.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Opérations récentes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dernières réservations et demandes d'achat.</p>
          </div>
        </div>

        {stats.recentOperations.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Aucune opération pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">Référence</th>
                  <th className="py-4 font-semibold">Client</th>
                  <th className="py-4 font-semibold">Véhicule</th>
                  <th className="py-4 font-semibold">Type</th>
                  <th className="py-4 font-semibold">Montant</th>
                  <th className="py-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOperations.map((operation) => (
                  <tr key={operation.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{operation.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4">{operation.customer}</td>
                    <td className="py-4">{operation.vehicle}</td>
                    <td className="py-4">{operation.type}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(operation.amount)}</td>
                    <td className="py-4"><OperationBadge status={operation.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
