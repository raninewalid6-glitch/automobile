import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CircleDollarSign, Eye, Filter, Search, WalletCards } from "lucide-react";
import { adminBookings, bookingStatusLabels, bookingStatusStyles, paymentStatusLabels, paymentStatusStyles } from "../mock/adminBookings.mock";

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
  paymentMethod: "all",
  date: "",
};

function uniqueBookingValues(selector) {
  return [...new Set(adminBookings.map(selector).filter(Boolean))].sort();
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${bookingStatusStyles[status] ?? bookingStatusStyles.PENDING}`}>
      {bookingStatusLabels[status] ?? status}
    </span>
  );
}

function PaymentBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${paymentStatusStyles[status] ?? paymentStatusStyles.PENDING}`}>
      {paymentStatusLabels[status] ?? status}
    </span>
  );
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export default function BookingsPage() {
  const [filters, setFilters] = useState(initialFilters);

  const filteredBookings = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return adminBookings.filter((booking) => {
      const matchesSearch = !searchValue || [booking.id, booking.client.name, booking.client.phone, booking.car.title, booking.car.plateNumber, booking.owner.name]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesStatus = filters.status === "all" || booking.status === filters.status;
      const matchesCity = filters.city === "all" || booking.car.city === filters.city || booking.client.city === filters.city || booking.owner.city === filters.city;
      const matchesOwner = filters.owner === "all" || booking.owner.name === filters.owner;
      const matchesPaymentMethod = filters.paymentMethod === "all" || booking.paymentMethod === filters.paymentMethod;
      const matchesDate = !filters.date || (booking.startDate <= filters.date && booking.endDate >= filters.date);

      return matchesSearch && matchesStatus && matchesCity && matchesOwner && matchesPaymentMethod && matchesDate;
    });
  }, [filters]);

  const totals = filteredBookings.reduce((accumulator, booking) => ({
    amount: accumulator.amount + booking.totalAmount,
    commission: accumulator.commission + booking.commissionAmount,
    ownerAmount: accumulator.ownerAmount + booking.ownerAmount,
  }), { amount: 0, commission: 0, ownerAmount: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion réservations location mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Réservations location</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Consultez les locations, paiements, propriétaires et commissions avec une base de données mock prête pour l'intégration backend.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
            <CalendarDays className="h-6 w-6" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">Total filtré</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredBookings.length} réservations</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Montant location</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.amount)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Commission plateforme</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.commission)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Montant propriétaires</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.ownerAmount)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          Filtres réservations
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Recherche ID, client, voiture..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">Tous statuts</option>
            {Object.entries(bookingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">Toutes villes</option>
            {uniqueBookingValues((booking) => booking.car.city).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.owner} onChange={(event) => handleFilterChange("owner", event.target.value)}>
            <option value="all">Tous owners</option>
            {uniqueBookingValues((booking) => booking.owner.name).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.paymentMethod} onChange={(event) => handleFilterChange("paymentMethod", event.target.value)}>
            <option value="all">Tous paiements</option>
            {uniqueBookingValues((booking) => booking.paymentMethod).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <input
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
            type="date"
            value={filters.date}
            onChange={(event) => handleFilterChange("date", event.target.value)}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-4 font-semibold">Référence</th>
                <th className="py-4 font-semibold">Client</th>
                <th className="py-4 font-semibold">Voiture</th>
                <th className="py-4 font-semibold">Owner</th>
                <th className="py-4 font-semibold">Dates</th>
                <th className="py-4 font-semibold">Montant</th>
                <th className="py-4 font-semibold">Paiement</th>
                <th className="py-4 font-semibold">Statut</th>
                <th className="py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4 font-black text-gray-900 dark:text-white">{booking.id}</td>
                  <td className="py-4">
                    <p className="font-bold text-gray-900 dark:text-white">{booking.client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{booking.client.phone}</p>
                  </td>
                  <td className="py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.car.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{booking.car.city} · {booking.car.plateNumber}</p>
                  </td>
                  <td className="py-4">{booking.owner.name}</td>
                  <td className="py-4">
                    <p>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{booking.days} jours · {currencyFormatter.format(booking.rentPricePerDay)}/jour</p>
                  </td>
                  <td className="py-4">
                    <p className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.totalAmount)}</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Commission {currencyFormatter.format(booking.commissionAmount)}</p>
                  </td>
                  <td className="py-4">
                    <div className="space-y-2">
                      <p className="inline-flex items-center gap-2 text-gray-900 dark:text-white"><WalletCards className="h-4 w-4 text-orange-700 dark:text-orange-300" />{booking.paymentMethod}</p>
                      <PaymentBadge status={booking.paymentStatus} />
                    </div>
                  </td>
                  <td className="py-4"><StatusBadge status={booking.status} /></td>
                  <td className="py-4 text-right">
                    <Link className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 font-bold text-gray-900 dark:text-white transition hover:border-red-500/50 hover:bg-red-500/10" to={`/admin/bookings/${booking.id}`}>
                      <Eye className="h-4 w-4" /> Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucune réservation ne correspond aux filtres.</div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <CircleDollarSign className="h-7 w-7 text-red-700 dark:text-red-200" />
          <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-100">Commission moyenne</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{filteredBookings.length ? currencyFormatter.format(totals.commission / filteredBookings.length) : currencyFormatter.format(0)}</p>
        </div>
        <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
          <WalletCards className="h-7 w-7 text-orange-700 dark:text-orange-200" />
          <p className="mt-3 text-sm font-semibold text-orange-700 dark:text-orange-100">Encaissement moyen</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{filteredBookings.length ? currencyFormatter.format(totals.amount / filteredBookings.length) : currencyFormatter.format(0)}</p>
        </div>
      </section>
    </div>
  );
}
