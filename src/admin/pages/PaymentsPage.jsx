import React, { useEffect, useMemo, useState } from "react";
import { Banknote, Filter, Plus, RotateCcw, Search, WalletCards, X } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { paymentMethodLabels, paymentStatusLabels, paymentStatusStyles } from "../lib/paymentOptions";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const initialFilters = { search: "", method: "all", status: "all" };

const emptyForm = { targetType: "booking", targetId: "", amount: "", method: "WAAFI", providerRef: "", note: "" };

const inputClass = "w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/50";

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${paymentStatusStyles[status] ?? paymentStatusStyles.PENDING}`}>
      {paymentStatusLabels[status] ?? status}
    </span>
  );
}

export default function PaymentsPage() {
  const { token } = useAdminAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAll = () => {
    Promise.all([
      apiFetch("/admin/payments", { token }),
      apiFetch("/admin/bookings", { token }),
      apiFetch("/admin/purchases", { token }),
    ])
      .then(([paymentsData, bookingsData, purchasesData]) => {
        setPayments(paymentsData.payments);
        setBookings(bookingsData.bookings);
        setPurchases(purchasesData.purchases);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [token]);

  const filteredPayments = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch = !searchValue || [payment.id, payment.client.name, payment.target.car, payment.providerRef]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesMethod = filters.method === "all" || payment.method === filters.method;
      const matchesStatus = filters.status === "all" || payment.status === filters.status;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [filters, payments]);

  const totals = filteredPayments.reduce((accumulator, payment) => ({
    paid: accumulator.paid + (payment.status === "PAID" ? payment.amount : 0),
    refunded: accumulator.refunded + (payment.status === "REFUNDED" ? payment.amount : 0),
  }), { paid: 0, refunded: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleCreatePayment = async (event) => {
    event.preventDefault();
    if (!form.targetId) {
      setFormError("Choisis une réservation ou une vente");
      return;
    }
    setSaving(true);
    setFormError("");
    setSuccessMessage("");
    try {
      const body = {
        [form.targetType === "booking" ? "bookingId" : "purchaseId"]: form.targetId,
        method: form.method,
        providerRef: form.providerRef || undefined,
        note: form.note || undefined,
      };
      if (form.amount !== "") body.amount = Number(form.amount);

      const data = await apiFetch("/admin/payments", { method: "POST", token, body });
      setForm(emptyForm);
      setShowForm(false);
      setSuccessMessage(
        data.bookingConfirmed
          ? "Paiement enregistré — la réservation est maintenant entièrement payée et confirmée ✅"
          : "Paiement enregistré ✅"
      );
      loadAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const refundPayment = async (payment) => {
    if (!window.confirm(`Marquer ce paiement de ${currencyFormatter.format(payment.amount)} comme remboursé ?`)) return;
    try {
      const data = await apiFetch(`/admin/payments/${payment.id}/status`, { method: "PUT", token, body: { status: "REFUNDED" } });
      setPayments((current) => current.map((item) => (item.id === payment.id ? data.payment : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  const targetOptions = form.targetType === "booking"
    ? bookings.map((booking) => ({
        id: booking.id,
        label: `${booking.id.slice(0, 8).toUpperCase()} · ${booking.client.name} · ${booking.car.title} · ${currencyFormatter.format(booking.totalAmount)}`,
      }))
    : purchases.map((purchase) => ({
        id: purchase.id,
        label: `${purchase.id.slice(0, 8).toUpperCase()} · ${purchase.client.name} · ${purchase.car.title} · ${currencyFormatter.format(purchase.price)}`,
      }));

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion paiements
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Paiements</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Enregistre les paiements reçus (Waafi, D-Money, MasterCard, espèces) sur les réservations et les ventes.
              Une réservation entièrement payée est confirmée automatiquement.
            </p>
          </div>
          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.02]"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {showForm ? "Fermer" : "Enregistrer un paiement"}
          </button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-700 dark:text-emerald-200">Total encaissé (filtré)</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.paid)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Paiements (filtré)</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{filteredPayments.length}</p>
          </div>
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
            <p className="text-sm text-blue-700 dark:text-blue-200">Remboursé (filtré)</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.refunded)}</p>
          </div>
        </div>
      </section>

      {successMessage && (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </p>
      )}

      {showForm && (
        <section className="rounded-[2rem] border border-orange-500/20 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enregistrer un paiement reçu</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Laisse le montant vide pour encaisser automatiquement tout ce qui reste dû.
          </p>
          <form onSubmit={handleCreatePayment} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <select className={inputClass} value={form.targetType} onChange={(event) => setForm({ ...form, targetType: event.target.value, targetId: "" })}>
              <option value="booking">Réservation (location)</option>
              <option value="purchase">Vente (achat)</option>
            </select>
            <select className={`${inputClass} xl:col-span-2`} value={form.targetId} onChange={(event) => setForm({ ...form, targetId: event.target.value })} required>
              <option value="">— Choisir {form.targetType === "booking" ? "une réservation" : "une vente"} —</option>
              {targetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <input className={inputClass} type="number" min="1" placeholder="Montant (vide = reste dû)" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
            <select className={inputClass} value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
              {Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input className={inputClass} placeholder="Référence (ex: WF-2026-0042)" value={form.providerRef} onChange={(event) => setForm({ ...form, providerRef: event.target.value })} />
            <input className={`${inputClass} xl:col-span-2`} placeholder="Note (optionnel)" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer le paiement"}
            </button>
          </form>
          {formError && (
            <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
              {formError}
            </p>
          )}
        </section>
      )}

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          Filtres paiements
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Recherche client, voiture, référence..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className={inputClass} value={filters.method} onChange={(event) => handleFilterChange("method", event.target.value)}>
            <option value="all">Toutes méthodes</option>
            {Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className={inputClass} value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">Tous statuts</option>
            {Object.entries(paymentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement des paiements...</p>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <WalletCards className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600" />
            <p className="mt-3 font-semibold">Aucun paiement pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">Référence</th>
                  <th className="py-4 font-semibold">Client</th>
                  <th className="py-4 font-semibold">Opération</th>
                  <th className="py-4 font-semibold">Méthode</th>
                  <th className="py-4 font-semibold">Montant</th>
                  <th className="py-4 font-semibold">Date</th>
                  <th className="py-4 font-semibold">Statut</th>
                  <th className="py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4">
                      <p className="font-black text-gray-900 dark:text-white">{payment.id.slice(0, 8).toUpperCase()}</p>
                      {payment.providerRef && <p className="text-xs text-gray-500 dark:text-gray-400">{payment.providerRef}</p>}
                    </td>
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{payment.client.name}</td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{payment.target.type === "booking" ? "Location" : "Achat"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{payment.target.car}</p>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <Banknote className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                        {paymentMethodLabels[payment.method] ?? payment.method}
                      </span>
                    </td>
                    <td className="py-4 font-black text-gray-900 dark:text-white">{currencyFormatter.format(payment.amount)}</td>
                    <td className="py-4">{payment.paidAt ? dateTimeFormatter.format(new Date(payment.paidAt)) : "—"}</td>
                    <td className="py-4"><StatusBadge status={payment.status} /></td>
                    <td className="py-4 text-right">
                      {payment.status === "PAID" && (
                        <button
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                          onClick={() => refundPayment(payment)}
                          title="Marquer remboursé"
                        >
                          <RotateCcw className="h-4 w-4" /> Rembourser
                        </button>
                      )}
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
