import React, { useMemo, useState } from "react";
import { Banknote, CalendarDays, CheckCircle2, CreditCard, Filter, ReceiptText, Search, WalletCards } from "lucide-react";
import CashValidationDialog from "../components/CashValidationDialog";
import { adminPayments, paymentMethodLabels, paymentMethods, paymentStatusLabels, paymentStatuses, paymentStatusStyles } from "../mock/adminPayments.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const initialFilters = {
  search: "",
  method: "all",
  status: "all",
  date: "",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${paymentStatusStyles[status] ?? paymentStatusStyles.PENDING}`}>
      {paymentStatusLabels[status] ?? status}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return dateTimeFormatter.format(new Date(value));
}

function getPaymentDate(payment) {
  return payment.paidAt ?? payment.createdAt;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState(adminPayments);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedCashPayment, setSelectedCashPayment] = useState(null);

  const filteredPayments = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch = !searchValue || [payment.id, payment.relatedId, payment.client, payment.amount, payment.method, payment.status, payment.providerRef]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesMethod = filters.method === "all" || payment.method === filters.method;
      const matchesStatus = filters.status === "all" || payment.status === filters.status;
      const matchesDate = !filters.date || getPaymentDate(payment)?.startsWith(filters.date);

      return matchesSearch && matchesMethod && matchesStatus && matchesDate;
    });
  }, [filters, payments]);

  const totals = filteredPayments.reduce((accumulator, payment) => ({
    amount: accumulator.amount + payment.amount,
    paid: accumulator.paid + (payment.status === "PAID" ? payment.amount : 0),
    pendingCash: accumulator.pendingCash + (payment.method === "CASH" && payment.status === "PENDING" ? 1 : 0),
  }), { amount: 0, paid: 0, pendingCash: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleValidateCash = (paymentId, note) => {
    setPayments((currentPayments) => currentPayments.map((payment) => {
      if (payment.id !== paymentId) {
        return payment;
      }

      return {
        ...payment,
        status: "PAID",
        paidAt: new Date().toISOString(),
        note: note || payment.note,
      };
    }));
    setSelectedCashPayment(null);
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion paiements mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Paiements</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Pilotez les paiements de réservations et d'achats avec des données mock uniquement : WAAFI, D-Money, Mastercard et cash.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
            <CreditCard className="h-6 w-6" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">Total filtré</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredPayments.length} paiements</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Volume filtré</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.amount)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Montant payé</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.paid)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Cash à valider</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{totals.pendingCash}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          Filtres paiements
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              placeholder="Rechercher ID, client, ref provider..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.method} onChange={(event) => handleFilterChange("method", event.target.value)}>
            <option value="all">Toutes méthodes</option>
            {paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">Tous statuts</option>
            {paymentStatuses.map((status) => <option key={status} value={status}>{paymentStatusLabels[status]}</option>)}
          </select>
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-gray-500 dark:text-gray-400">
            <CalendarDays className="h-4 w-4" />
            <input
              type="date"
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none"
              value={filters.date}
              onChange={(event) => handleFilterChange("date", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-4 font-semibold">Payment ID</th>
                <th className="py-4 font-semibold">Booking/Purchase ID</th>
                <th className="py-4 font-semibold">Client</th>
                <th className="py-4 font-semibold">Amount</th>
                <th className="py-4 font-semibold">Method</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 font-semibold">ProviderRef</th>
                <th className="py-4 font-semibold">PaidAt</th>
                <th className="py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4 font-black text-gray-900 dark:text-white">{payment.id}</td>
                  <td className="py-4">
                    <p className="font-bold text-gray-900 dark:text-white">{payment.relatedId}</p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{payment.relatedType}</p>
                  </td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{payment.client}</td>
                  <td className="py-4 font-black text-gray-900 dark:text-white">{currencyFormatter.format(payment.amount)}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1 text-xs font-bold text-orange-700 dark:text-orange-200">
                      {payment.method === "CASH" ? <Banknote className="h-3 w-3" /> : <WalletCards className="h-3 w-3" />}
                      {paymentMethodLabels[payment.method]}
                    </span>
                  </td>
                  <td className="py-4"><StatusBadge status={payment.status} /></td>
                  <td className="py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{payment.providerRef}</td>
                  <td className="py-4">{formatDateTime(payment.paidAt)}</td>
                  <td className="py-4 text-right">
                    {payment.method === "CASH" && payment.status === "PENDING" ? (
                      <button type="button" onClick={() => setSelectedCashPayment(payment)} className="inline-flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 font-bold text-orange-700 dark:text-orange-100 transition hover:border-orange-400/60 hover:bg-orange-500/20">
                        <CheckCircle2 className="h-4 w-4" /> Valider cash
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <ReceiptText className="h-4 w-4" /> Lecture seule
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucun paiement ne correspond aux filtres.</div>
        )}
      </section>

      <CashValidationDialog
        key={selectedCashPayment?.id ?? "cash-validation-closed"}
        payment={selectedCashPayment}
        open={Boolean(selectedCashPayment)}
        onClose={() => setSelectedCashPayment(null)}
        onConfirm={handleValidateCash}
      />
    </div>
  );
}
