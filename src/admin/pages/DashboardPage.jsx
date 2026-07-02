import React from "react";
import { Banknote, Car, CircleDollarSign, Clock3, CreditCard, HandCoins, KeyRound, ShoppingCart, WalletCards } from "lucide-react";
import KpiCard from "../components/KpiCard";
import StatusBadge from "../components/StatusBadge";
import { adminStats, recentOperations } from "../mock/adminStats.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const kpis = [
  {
    title: "Total voitures",
    value: adminStats.inventory.totalCars,
    icon: Car,
    helper: "Inventaire global location + vente",
    tone: "red",
  },
  {
    title: "Voitures à louer",
    value: adminStats.inventory.carsForRent,
    icon: KeyRound,
    helper: "Disponibles pour réservations",
    tone: "orange",
  },
  {
    title: "Voitures à vendre",
    value: adminStats.inventory.carsForSale,
    icon: ShoppingCart,
    helper: "Catalogue vente actif",
    tone: "slate",
  },
  {
    title: "Réservations ce mois",
    value: adminStats.activity.reservationsThisMonth,
    icon: Clock3,
    helper: "Locations créées sur le mois",
    tone: "red",
  },
  {
    title: "Demandes d'achat",
    value: adminStats.activity.purchaseRequests,
    icon: HandCoins,
    helper: "À qualifier par l'équipe admin",
    tone: "orange",
  },
  {
    title: "Paiements en attente",
    value: adminStats.activity.pendingPayments,
    icon: CreditCard,
    helper: "Waafi, D-Money, MasterCard, cash",
    tone: "slate",
  },
  {
    title: "Revenus location",
    value: currencyFormatter.format(adminStats.revenue.rentalRevenue),
    icon: WalletCards,
    helper: "Montants validés location",
    tone: "red",
  },
  {
    title: "Revenus vente",
    value: currencyFormatter.format(adminStats.revenue.salesRevenue),
    icon: Banknote,
    helper: "Ventes automobiles confirmées",
    tone: "orange",
  },
  {
    title: "Commission plateforme",
    value: currencyFormatter.format(adminStats.revenue.platformCommission),
    icon: CircleDollarSign,
    helper: "Commission nette estimée",
    tone: "slate",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Dashboard mock data
            </p>
            <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white lg:text-5xl lg:leading-tight">
              Base <span className="whitespace-nowrap bg-transparent text-gray-900 dark:text-white">Admin/SuperAdmin</span> pour piloter la plateforme automobile.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 dark:text-gray-400">
              Cette première base centralise les indicateurs de location, vente, paiements et commissions sans connecter de backend.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-orange-500/20 bg-gradient-to-br from-red-600/20 to-orange-500/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-700 dark:text-orange-200">Revenu total</p>
            <p className="mt-4 text-4xl font-black text-gray-900 dark:text-white">
              {currencyFormatter.format(adminStats.revenue.rentalRevenue + adminStats.revenue.salesRevenue)}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Vue consolidée mock des flux location et vente pour préparer l'intégration paiement.
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Réservations, demandes d'achat et paiements mock.</p>
          </div>
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-700 dark:text-orange-200">
            Temps réel bientôt
          </span>
        </div>

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
              {recentOperations.map((operation) => (
                <tr key={operation.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4 font-bold text-gray-900 dark:text-white">{operation.id}</td>
                  <td className="py-4">{operation.customer}</td>
                  <td className="py-4">{operation.vehicle}</td>
                  <td className="py-4">{operation.type}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(operation.amount)}</td>
                  <td className="py-4"><StatusBadge status={operation.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
