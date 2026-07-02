import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CarFront, FileText, MapPin, ReceiptText, UserRound, WalletCards } from "lucide-react";
import { adminBookings, bookingStatusLabels, bookingStatusStyles, paymentStatusLabels, paymentStatusStyles } from "../mock/adminBookings.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function StatusPill({ status, type = "booking" }) {
  const styles = type === "payment" ? paymentStatusStyles : bookingStatusStyles;
  const labels = type === "payment" ? paymentStatusLabels : bookingStatusLabels;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${styles[status] ?? styles.PENDING}`}>
      {labels[status] ?? status}
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
          <dd className="mt-2 break-words font-bold text-gray-900 dark:text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const booking = adminBookings.find((item) => item.id === id);

  if (!booking) {
    return (
      <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-700 dark:text-red-300">Réservation introuvable</p>
        <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-white">Aucun mock ne correspond à {id}</h2>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 font-bold text-white" to="/admin/bookings">
          <ArrowLeft className="h-4 w-4" /> Retour aux réservations
        </Link>
      </div>
    );
  }

  const rentalSubtotal = booking.days * booking.rentPricePerDay;
  const receiptLines = [
    ["Location véhicule", `${booking.days} jours × ${currencyFormatter.format(booking.rentPricePerDay)}`, booking.totalAmount],
    ["Commission plateforme", `${booking.commissionRate}% du montant location`, booking.commissionAmount],
    ["Reversement propriétaire", "Montant net owner", booking.ownerAmount],
    ["Caution", "Non incluse dans le revenu", booking.depositAmount],
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-white" to="/admin/bookings">
          <ArrowLeft className="h-4 w-4" /> Retour aux réservations
        </Link>
        <div className="flex flex-wrap gap-2">
          <StatusPill status={booking.status} />
          <StatusPill status={booking.paymentStatus} type="payment" />
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 shadow-2xl shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 lg:p-8">
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Détails réservation location
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{booking.id}</h2>
            <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {booking.car.title} réservé par {booking.client.name} du {formatDate(booking.startDate)} au {formatDate(booking.endDate)}.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Durée</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{booking.days} jours</p>
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
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-700 dark:text-orange-200">Résumé paiement</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
                <span className="text-gray-500 dark:text-gray-400">Méthode</span>
                <span className="font-black text-gray-900 dark:text-white">{booking.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
                <span className="text-gray-500 dark:text-gray-400">Statut paiement</span>
                <StatusPill status={booking.paymentStatus} type="payment" />
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
        <DetailCard icon={UserRound} title="Client details">
          <DefinitionList items={[
            ["Nom", booking.client.name],
            ["Téléphone", booking.client.phone],
            ["Email", booking.client.email],
            ["Ville", booking.client.city],
            ["Document", booking.client.document],
          ]} />
        </DetailCard>

        <DetailCard icon={CarFront} title="Car details">
          <DefinitionList items={[
            ["Véhicule", booking.car.title],
            ["Plaque", booking.car.plateNumber],
            ["Catégorie", booking.car.category],
            ["Ville", booking.car.city],
            ["Retrait", booking.car.pickupAddress],
          ]} />
        </DetailCard>

        <DetailCard icon={UserRound} title="Owner details">
          <DefinitionList items={[
            ["Owner", booking.owner.name],
            ["Téléphone", booking.owner.phone],
            ["Email", booking.owner.email],
            ["Ville", booking.owner.city],
            ["ID owner", booking.owner.id],
          ]} />
        </DetailCard>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1fr_1fr]">
        <DetailCard icon={CalendarDays} title="Pricing breakdown">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Prix / jour</span>
              <span className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.rentPricePerDay)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Nombre de jours</span>
              <span className="font-black text-gray-900 dark:text-white">{booking.days}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <span className="text-gray-500 dark:text-gray-400">Sous-total location</span>
              <span className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(rentalSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
              <span className="font-bold text-orange-700 dark:text-orange-100">Total payé</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.totalAmount)}</span>
            </div>
          </div>
        </DetailCard>

        <DetailCard icon={WalletCards} title="Commission breakdown">
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
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Note admin</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{booking.notes}</p>
            </div>
          </div>
        </DetailCard>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.05fr_0.95fr]">
        <DetailCard icon={ReceiptText} title="Payment history">
          {booking.paymentHistory.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-gray-500 dark:text-gray-400">
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="py-3 font-semibold">ID</th>
                    <th className="py-3 font-semibold">Date</th>
                    <th className="py-3 font-semibold">Méthode</th>
                    <th className="py-3 font-semibold">Référence</th>
                    <th className="py-3 font-semibold">Montant</th>
                    <th className="py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                      <td className="py-3 font-bold text-gray-900 dark:text-white">{payment.id}</td>
                      <td className="py-3">{formatDate(payment.date)}</td>
                      <td className="py-3">{payment.method}</td>
                      <td className="py-3">{payment.reference}</td>
                      <td className="py-3 font-black text-gray-900 dark:text-white">{currencyFormatter.format(payment.amount)}</td>
                      <td className="py-3"><StatusPill status={payment.status} type="payment" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun paiement enregistré pour cette demande en attente.
            </div>
          )}
        </DetailCard>

        <DetailCard icon={FileText} title="Receipt preview">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white p-6 text-zinc-950">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">DriveUp</p>
                <h4 className="mt-2 text-2xl font-black">Reçu {booking.id}</h4>
              </div>
              <MapPin className="h-7 w-7 text-orange-500" />
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <p><span className="font-bold">Client:</span> {booking.client.name}</p>
              <p><span className="font-bold">Véhicule:</span> {booking.car.title}</p>
              <p><span className="font-bold">Période:</span> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
            </div>
            <div className="mt-5 space-y-3">
              {receiptLines.map(([label, helper, amount]) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-2xl bg-zinc-100 px-4 py-3">
                  <div>
                    <p className="font-black">{label}</p>
                    <p className="text-xs text-zinc-500">{helper}</p>
                  </div>
                  <p className="font-black">{currencyFormatter.format(amount)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-white dark:bg-zinc-950 px-4 py-4 text-gray-900 dark:text-white">
              <div className="flex items-center justify-between">
                <span className="font-bold">Total location</span>
                <span className="text-2xl font-black">{currencyFormatter.format(booking.totalAmount)}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">Mode paiement: {booking.paymentMethod} · Statut: {paymentStatusLabels[booking.paymentStatus]}</p>
            </div>
          </div>
        </DetailCard>
      </section>
    </div>
  );
}
