import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CarFront, Eye, UserRound } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { carStatusLabels, carStatusStyles } from "../lib/carOptions";
import { bookingStatusLabels, bookingStatusStyles } from "../lib/bookingOptions";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function getOfferType(car) {
  if (car.isForRent && car.isForSale) return "Location + Vente";
  if (car.isForRent) return "Location";
  if (car.isForSale) return "Vente";
  return "Non publié";
}

export default function OwnerDetailsPage() {
  const { id } = useParams();
  const { token } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/admin/owners/${id}`, { token })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement du propriétaire...</p>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-700 dark:text-red-300">Propriétaire introuvable</p>
        <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{error || `Aucun propriétaire ne correspond à ${id}`}</h2>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 font-bold text-white" to="/admin/owners">
          <ArrowLeft className="h-4 w-4" /> Retour aux propriétaires
        </Link>
      </div>
    );
  }

  const { owner, cars, bookings } = data;

  return (
    <div className="space-y-7">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-white" to="/admin/owners">
        <ArrowLeft className="h-4 w-4" /> Retour aux propriétaires
      </Link>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-red-600 to-orange-500">
              <UserRound className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-4xl">{owner.name}</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {owner.email}{owner.phone ? ` · ${owner.phone}` : ""}{owner.city ? ` · ${owner.city}` : ""}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Inscrit le {new Date(owner.joinedAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Voitures</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{owner.metrics.totalCars}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Réservations</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{owner.metrics.reservations}</p>
          </div>
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-700 dark:text-emerald-200">Revenus reversés</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(owner.metrics.revenue)}</p>
          </div>
          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
            <p className="text-sm text-orange-700 dark:text-orange-200">Commission plateforme</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(owner.metrics.commission)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
            <CarFront className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Ses voitures ({cars.length})</h3>
        </div>

        {cars.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
            Aucune voiture rattachée à ce propriétaire pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">Voiture</th>
                  <th className="py-4 font-semibold">Ville</th>
                  <th className="py-4 font-semibold">Type</th>
                  <th className="py-4 font-semibold">Location/jour</th>
                  <th className="py-4 font-semibold">Prix vente</th>
                  <th className="py-4 font-semibold">Revenus</th>
                  <th className="py-4 font-semibold">Statut</th>
                  <th className="py-4 text-right font-semibold">Voir</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{car.title}</td>
                    <td className="py-4">{car.city}</td>
                    <td className="py-4">{getOfferType(car)}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{car.rentPricePerDay ? currencyFormatter.format(car.rentPricePerDay) : "—"}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{car.salePrice ? currencyFormatter.format(car.salePrice) : "—"}</td>
                    <td className="py-4 font-semibold text-emerald-700 dark:text-emerald-300">{currencyFormatter.format(car.revenue)}</td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${carStatusStyles[car.status] ?? carStatusStyles.INACTIVE}`}>
                        {carStatusLabels[car.status] ?? car.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link to={`/admin/cars/${car.id}`} className="inline-flex rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" title="Voir la voiture">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Dernières réservations ({bookings.length})</h3>
        </div>

        {bookings.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
            Aucune réservation sur les voitures de ce propriétaire.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">Référence</th>
                  <th className="py-4 font-semibold">Client</th>
                  <th className="py-4 font-semibold">Voiture</th>
                  <th className="py-4 font-semibold">Période</th>
                  <th className="py-4 font-semibold">Total</th>
                  <th className="py-4 font-semibold">Part owner</th>
                  <th className="py-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4 font-black text-gray-900 dark:text-white">
                      <Link to={`/admin/bookings/${booking.id}`} className="hover:text-red-500">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-4">{booking.client}</td>
                    <td className="py-4">{booking.car}</td>
                    <td className="py-4">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(booking.totalAmount)}</td>
                    <td className="py-4 font-semibold text-emerald-700 dark:text-emerald-300">{currencyFormatter.format(booking.ownerAmount)}</td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${bookingStatusStyles[booking.status] ?? bookingStatusStyles.PENDING}`}>
                        {bookingStatusLabels[booking.status] ?? booking.status}
                      </span>
                    </td>
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
