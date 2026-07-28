import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CarFront, CheckCircle2, Flag, UserRound, WalletCards, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { bookingStatusLabels, bookingStatusStyles } from "../lib/bookingOptions";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${bookingStatusStyles[status] ?? bookingStatusStyles.PENDING}`}>
      {bookingStatusLabels[status] ?? status}
    </span>
  );
}

function DetailCard({ icon, title, children }) {
  return (
    <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
          {React.createElement(icon, { className: "h-5 w-5 text-white" })}
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DefinitionList({ items }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{label}</dt>
          <dd className="mt-2 break-words font-bold text-gray-900 dark:text-white">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const { token } = useAdminAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/admin/bookings/${id}`, { token })
      .then((data) => setBooking(data.booking))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const updateStatus = async (status) => {
    try {
      const data = await apiFetch(`/admin/bookings/${id}/status`, { method: "PUT", token, body: { status } });
      setBooking(data.booking);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement de la réservation...</p>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-700 dark:text-red-300">Réservation introuvable</p>
        <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{error || `Aucune réservation ne correspond à ${id}`}</h2>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 font-bold text-white" to="/admin/bookings">
          <ArrowLeft className="h-4 w-4" /> Retour aux réservations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-white" to="/admin/bookings">
          <ArrowLeft className="h-4 w-4" /> Retour aux réservations
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={booking.status} />
          {(booking.status === "PENDING" || booking.status === "PENDING_PAYMENT") && (
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              onClick={() => updateStatus("CONFIRMED")}
            >
              <CheckCircle2 className="h-4 w-4" /> Confirmer
            </button>
          )}
          {booking.status === "CONFIRMED" && (
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20"
              onClick={() => updateStatus("COMPLETED")}
            >
              <Flag className="h-4 w-4" /> Marquer terminée
            </button>
          )}
          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-300 hover:bg-red-500/20"
              onClick={() => updateStatus("CANCELLED")}
            >
              <XCircle className="h-4 w-4" /> Annuler
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 shadow-2xl shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 lg:p-8">
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Détails réservation location
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              Réservation {booking.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {booking.car.title} réservé par {booking.client.name} du {formatDate(booking.startDate)} au {formatDate(booking.endDate)}.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Durée</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{booking.days} jour{booking.days > 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.totalAmount)}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Owner net</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.ownerAmount)}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-black/10 dark:border-white/10 bg-gradient-to-br from-red-600/15 to-orange-500/10 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-700 dark:text-orange-200">Résumé</p>
            <div className="mt-5 space-y-4">
              {booking.car.image && (
                <img src={booking.car.image} alt={booking.car.title} className="h-40 w-full rounded-3xl object-cover" />
              )}
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
                <span className="text-gray-500 dark:text-gray-400">Statut</span>
                <StatusPill status={booking.status} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
                <span className="text-gray-500 dark:text-gray-400">Créée le</span>
                <span className="font-black text-gray-900 dark:text-white">{new Date(booking.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-3">
        <DetailCard icon={UserRound} title="Client">
          <DefinitionList items={[
            ["Nom", booking.client.name],
            ["Téléphone", booking.client.phone],
            ["Email", booking.client.email],
          ]} />
        </DetailCard>

        <DetailCard icon={CarFront} title="Voiture">
          <DefinitionList items={[
            ["Véhicule", booking.car.title],
            ["Plaque", booking.car.plateNumber],
            ["Ville", booking.car.city],
            ["Prix / jour", currencyFormatter.format(booking.car.pricePerDay)],
          ]} />
        </DetailCard>

        <DetailCard icon={CalendarDays} title="Période">
          <DefinitionList items={[
            ["Début", formatDate(booking.startDate)],
            ["Fin", formatDate(booking.endDate)],
            ["Durée", `${booking.days} jour${booking.days > 1 ? "s" : ""}`],
            ["Owner", booking.owner],
          ]} />
        </DetailCard>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1fr_1fr]">
        <DetailCard icon={CalendarDays} title="Détail du prix">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Prix / jour</span>
              <span className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.car.pricePerDay)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Nombre de jours</span>
              <span className="font-black text-gray-900 dark:text-white">{booking.days}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
              <span className="font-bold text-orange-700 dark:text-orange-100">Total</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.totalAmount)}</span>
            </div>
          </div>
        </DetailCard>

        <DetailCard icon={WalletCards} title="Répartition">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Taux commission</span>
              <span className="font-black text-gray-900 dark:text-white">{booking.commissionRate}%</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Commission plateforme</span>
              <span className="font-black text-red-700 dark:text-red-200">{currencyFormatter.format(booking.commissionAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Reversement owner</span>
              <span className="font-black text-emerald-700 dark:text-emerald-200">{currencyFormatter.format(booking.ownerAmount)}</span>
            </div>
          </div>
        </DetailCard>
      </section>
    </div>
  );
}
