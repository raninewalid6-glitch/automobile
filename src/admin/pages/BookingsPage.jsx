import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, CircleDollarSign, Eye, Filter, Flag, Search, WalletCards, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
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

const initialFilters = {
  search: "",
  status: "all",
  city: "all",
  owner: "all",
  date: "",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${bookingStatusStyles[status] ?? bookingStatusStyles.PENDING}`}>
      {bookingStatusLabels[status] ?? status}
    </span>
  );
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export default function BookingsPage() {
  const { token } = useAdminAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/bookings", { token })
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const uniqueValues = (selector) => [...new Set(bookings.map(selector).filter(Boolean))].sort();

  const filteredBookings = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch = !searchValue || [booking.id, booking.client.name, booking.client.phone, booking.car.title, booking.car.plateNumber, booking.owner]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesStatus = filters.status === "all" || booking.status === filters.status;
      const matchesCity = filters.city === "all" || booking.car.city === filters.city;
      const matchesOwner = filters.owner === "all" || booking.owner === filters.owner;
      const matchesDate = !filters.date || (booking.startDate <= filters.date && booking.endDate >= filters.date);

      return matchesSearch && matchesStatus && matchesCity && matchesOwner && matchesDate;
    });
  }, [bookings, filters]);

  const totals = filteredBookings.reduce((accumulator, booking) => ({
    amount: accumulator.amount + booking.totalAmount,
    commission: accumulator.commission + booking.commissionAmount,
    ownerAmount: accumulator.ownerAmount + booking.ownerAmount,
  }), { amount: 0, commission: 0, ownerAmount: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const updateStatus = async (booking, status) => {
    try {
      const data = await apiFetch(`/admin/bookings/${booking.id}/status`, { method: "PUT", token, body: { status } });
      setBookings((current) => current.map((item) => (item.id === booking.id ? data.booking : item)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion réservations location
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Réservations location</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Consultez les locations, confirmez ou annulez les demandes — données en direct depuis la base.
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
              placeholder="Recherche client, voiture, plaque..."
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
            {uniqueValues((booking) => booking.car.city).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.owner} onChange={(event) => handleFilterChange("owner", event.target.value)}>
            <option value="all">Tous owners</option>
            {uniqueValues((booking) => booking.owner).map((value) => <option key={value} value={value}>{value}</option>)}
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
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement des réservations...</p>
        ) : (
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
                  <th className="py-4 font-semibold">Statut</th>
                  <th className="py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4 font-black text-gray-900 dark:text-white">{booking.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{booking.client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{booking.client.phone || booking.client.email}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.car.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{booking.car.city} · {booking.car.plateNumber}</p>
                    </td>
                    <td className="py-4">{booking.owner}</td>
                    <td className="py-4">
                      <p>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{booking.days} jour{booking.days > 1 ? "s" : ""} · {currencyFormatter.format(booking.car.pricePerDay)}/jour</p>
                    </td>
                    <td className="py-4">
                      <p className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(booking.totalAmount)}</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Commission {currencyFormatter.format(booking.commissionAmount)}</p>
                    </td>
                    <td className="py-4"><StatusBadge status={booking.status} /></td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {(booking.status === "PENDING" || booking.status === "PENDING_PAYMENT") && (
                          <button
                            className="rounded-xl border border-emerald-500/30 p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => updateStatus(booking, "CONFIRMED")}
                            title="Confirmer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <button
                            className="rounded-xl border border-blue-500/30 p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => updateStatus(booking, "COMPLETED")}
                            title="Marquer terminée"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        )}
                        {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                          <button
                            className="rounded-xl border border-red-500/30 p-2 text-red-700 dark:text-red-300 hover:bg-red-500/10"
                            onClick={() => updateStatus(booking, "CANCELLED")}
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <Link className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 font-bold text-gray-900 dark:text-white transition hover:border-red-500/50 hover:bg-red-500/10" to={`/admin/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" /> Détails
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredBookings.length === 0 && (
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
