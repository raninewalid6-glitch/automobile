import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeDollarSign, Banknote, CalendarDays, CarFront, CheckCircle2, Mail, MapPin, Phone, ShieldOff, ShoppingCart, UserRound, WalletCards } from "lucide-react";
import { adminOwners, ownerStatusLabels, ownerStatusStyles, purchaseRequestStatusLabels } from "../mock/adminOwners.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("fr-FR");

function InfoCard({ icon, label, value, helper }) {
  const IconComponent = icon;

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <IconComponent className="h-5 w-5 text-orange-700 dark:text-orange-300" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helper}</p>}
    </div>
  );
}

function OwnerStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${ownerStatusStyles[status] ?? ownerStatusStyles.inactive}`}>
      {ownerStatusLabels[status] ?? status}
    </span>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-3xl border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-6 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
      {label}
    </div>
  );
}

export default function OwnerDetailsPage() {
  const { id } = useParams();
  const originalOwner = adminOwners.find((item) => item.id === id);
  const [status, setStatus] = useState(originalOwner?.status ?? "inactive");

  if (!originalOwner) {
    return (
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Propriétaire introuvable</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">Aucun propriétaire mock ne correspond à l'identifiant {id}.</p>
        <Link to="/admin/owners" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white">
          Retour aux propriétaires
        </Link>
      </section>
    );
  }

  const owner = { ...originalOwner, status };
  const isActive = owner.status === "active";

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <Link to="/admin/owners" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Retour aux propriétaires
        </Link>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div>
            <OwnerStatusBadge status={owner.status} />
            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{owner.name}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">{owner.notes}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Gestionnaire</p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">{owner.manager}</p>
              </div>
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">KYC</p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">{owner.identityStatus}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-700 dark:text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isActive}
              onClick={() => setStatus("active")}
            >
              <CheckCircle2 className="h-5 w-5" /> Activer
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-700 dark:text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isActive}
              onClick={() => setStatus("inactive")}
            >
              <ShieldOff className="h-5 w-5" /> Désactiver
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={CarFront} label="Voitures" value={owner.cars.length} helper={`${owner.metrics.rentalCars} location · ${owner.metrics.saleCars} vente`} />
        <InfoCard icon={CalendarDays} label="Réservations" value={numberFormatter.format(owner.metrics.reservations)} helper="Historique mock" />
        <InfoCard icon={Banknote} label="Revenus" value={currencyFormatter.format(owner.metrics.revenue)} helper="Location + ventes" />
        <InfoCard icon={BadgeDollarSign} label="Commission due" value={currencyFormatter.format(owner.metrics.commissionDue)} helper="À collecter" />
      </section>

      <section className="grid gap-7 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-7">
          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profil complet</h3>
            <div className="mt-5 flex items-center gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
                <UserRound className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{owner.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inscrit le {owner.joinedAt}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3">
              {[
                [Phone, "Téléphone", owner.phone],
                [Mail, "Email", owner.email],
                [MapPin, "Adresse", `${owner.address}, ${owner.city}`],
              ].map(([IconComponent, label, value]) => (
                <div key={label} className="flex items-start gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
                  {React.createElement(IconComponent, { className: "mt-1 h-5 w-5 text-orange-700 dark:text-orange-300" })}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className="mt-1 font-bold text-gray-900 dark:text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenus & commission plateforme</h3>
            <div className="mt-5 grid gap-4">
              <InfoCard icon={WalletCards} label="Revenus propriétaire" value={currencyFormatter.format(owner.metrics.revenue)} helper={`Payout en attente: ${currencyFormatter.format(owner.metrics.payoutPending)}`} />
              <InfoCard icon={BadgeDollarSign} label="Commission plateforme" value={currencyFormatter.format(owner.metrics.platformCommission)} helper={`Solde dû: ${currencyFormatter.format(owner.metrics.commissionDue)}`} />
            </div>
          </section>
        </div>

        <div className="space-y-7">
          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Voitures</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Parc associé au propriétaire.</p>
              </div>
              <span className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">{owner.cars.length} véhicules</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-gray-500 dark:text-gray-400">
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="py-4 font-semibold">Voiture</th>
                    <th className="py-4 font-semibold">Type</th>
                    <th className="py-4 font-semibold">Ville</th>
                    <th className="py-4 font-semibold">Prix</th>
                    <th className="py-4 font-semibold">Revenus</th>
                    <th className="py-4 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {owner.cars.map((car) => (
                    <tr key={car.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                      <td className="py-4">
                        <p className="font-bold text-gray-900 dark:text-white">{car.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{car.id}</p>
                      </td>
                      <td className="py-4">{car.type}</td>
                      <td className="py-4">{car.city}</td>
                      <td className="py-4 font-semibold text-gray-900 dark:text-white">
                        {car.rentPricePerDay ? `${currencyFormatter.format(car.rentPricePerDay)}/j` : "—"}
                        {car.salePrice ? <span className="block text-xs text-orange-700 dark:text-orange-200">{currencyFormatter.format(car.salePrice)}</span> : null}
                      </td>
                      <td className="py-4 font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(car.revenue)}</td>
                      <td className="py-4">{car.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Réservations récentes</h3>
            <div className="mt-5 space-y-3">
              {owner.reservations.length === 0 && <EmptyState label="Aucune réservation récente pour ce propriétaire." />}
              {owner.reservations.map((reservation) => (
                <div key={reservation.id} className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{reservation.customer}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{reservation.car} · {reservation.period}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(reservation.amount)}</p>
                      <p className="mt-1 text-xs font-semibold text-orange-700 dark:text-orange-200">{reservation.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <div className="mb-5 flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-orange-700 dark:text-orange-300" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Demandes d'achat</h3>
            </div>
            <div className="space-y-3">
              {owner.purchaseRequests.length === 0 && <EmptyState label="Aucune demande d'achat ouverte." />}
              {owner.purchaseRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{request.customer}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{request.car}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(request.budget)}</p>
                      <p className="mt-1 text-xs font-semibold text-orange-700 dark:text-orange-200">{purchaseRequestStatusLabels[request.status] ?? request.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
