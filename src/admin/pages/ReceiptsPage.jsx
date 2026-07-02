import React, { useMemo, useState } from "react";
import { CalendarDays, Download, Eye, FileText, Filter, ReceiptText, Search, WalletCards } from "lucide-react";
import {
  adminReceipts,
  receiptPaymentMethodLabels,
  receiptPaymentMethods,
  receiptTypeLabels,
  receiptTypes,
  receiptTypeStyles,
} from "../mock/adminReceipts.mock";

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
  type: "all",
  method: "all",
};

function TypeBadge({ type }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${receiptTypeStyles[type] ?? receiptTypeStyles.BOOKING}`}>
      {receiptTypeLabels[type] ?? type}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return dateTimeFormatter.format(new Date(value));
}

export default function ReceiptsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const filteredReceipts = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return adminReceipts.filter((receipt) => {
      const matchesSearch = !searchValue || [
        receipt.receiptNumber,
        receipt.bookingOrPurchaseId,
        receipt.client,
        receipt.car,
        receipt.owner,
        receipt.type,
        receipt.paymentMethod,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesType = filters.type === "all" || receipt.type === filters.type;
      const matchesMethod = filters.method === "all" || receipt.paymentMethod === filters.method;

      return matchesSearch && matchesType && matchesMethod;
    });
  }, [filters]);

  const totals = filteredReceipts.reduce((accumulator, receipt) => ({
    amount: accumulator.amount + receipt.totalAmount,
    commission: accumulator.commission + receipt.commissionAmount,
    ownerShare: accumulator.ownerShare + receipt.ownerAmount,
  }), { amount: 0, commission: 0, ownerShare: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion reçus mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Reçus paiements</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Consultez les reçus émis pour les réservations et les achats avec le détail des montants, commissions et parts owners.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
            <ReceiptText className="h-6 w-6" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">Total filtré</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredReceipts.length} reçus</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Montant encaissé</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.amount)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Commission</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.commission)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Part owners</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.ownerShare)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          Filtres reçus
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              placeholder="Rechercher reçu, client, voiture, owner..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.type} onChange={(event) => handleFilterChange("type", event.target.value)}>
            <option value="all">Tous types</option>
            {receiptTypes.map((type) => <option key={type} value={type}>{receiptTypeLabels[type]}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.method} onChange={(event) => handleFilterChange("method", event.target.value)}>
            <option value="all">Toutes méthodes</option>
            {receiptPaymentMethods.map((method) => <option key={method} value={method}>{receiptPaymentMethodLabels[method]}</option>)}
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-4 font-semibold">Receipt number</th>
                <th className="py-4 font-semibold">Client</th>
                <th className="py-4 font-semibold">Car</th>
                <th className="py-4 font-semibold">Owner</th>
                <th className="py-4 font-semibold">Type</th>
                <th className="py-4 font-semibold">Amount</th>
                <th className="py-4 font-semibold">Commission</th>
                <th className="py-4 font-semibold">Owner share</th>
                <th className="py-4 font-semibold">Method</th>
                <th className="py-4 font-semibold">Date</th>
                <th className="py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.receiptNumber} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4">
                    <p className="font-black text-gray-900 dark:text-white">{receipt.receiptNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{receipt.bookingOrPurchaseId}</p>
                  </td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{receipt.client}</td>
                  <td className="py-4">{receipt.car}</td>
                  <td className="py-4">{receipt.owner}</td>
                  <td className="py-4"><TypeBadge type={receipt.type} /></td>
                  <td className="py-4 font-black text-gray-900 dark:text-white">{currencyFormatter.format(receipt.totalAmount)}</td>
                  <td className="py-4 text-orange-700 dark:text-orange-200">{currencyFormatter.format(receipt.commissionAmount)}</td>
                  <td className="py-4 text-emerald-700 dark:text-emerald-200">{currencyFormatter.format(receipt.ownerAmount)}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1 text-xs font-bold text-orange-700 dark:text-orange-100">
                      <WalletCards className="h-3 w-3" />
                      {receiptPaymentMethodLabels[receipt.paymentMethod] ?? receipt.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      {formatDateTime(receipt.issuedAt)}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setSelectedReceipt(receipt)} className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 font-bold text-gray-900 dark:text-white transition hover:border-red-500/50 hover:bg-red-500/10">
                        <Eye className="h-4 w-4" /> Voir reçu
                      </button>
                      <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 font-bold text-gray-400 dark:text-gray-600 opacity-70">
                        <Download className="h-4 w-4" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReceipts.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucun reçu ne correspond aux filtres.</div>
        )}
      </section>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl shadow-black/60">
            <div className="flex flex-col gap-4 border-b border-black/10 dark:border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-200">
                  <FileText className="h-4 w-4" /> Reçu mock
                </p>
                <h3 className="mt-3 text-2xl font-black text-gray-900 dark:text-white">{selectedReceipt.receiptNumber}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Transaction {selectedReceipt.bookingOrPurchaseId}</p>
              </div>
              <button type="button" onClick={() => setSelectedReceipt(null)} className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-gray-900 dark:hover:text-white">
                Fermer
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Client</p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">{selectedReceipt.client}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Owner</p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">{selectedReceipt.owner}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Voiture</p>
                <p className="mt-2 font-bold text-gray-900 dark:text-white">{selectedReceipt.car}</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/30 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p className="text-gray-500 dark:text-gray-400">Type <span className="float-right text-gray-900 dark:text-white">{receiptTypeLabels[selectedReceipt.type]}</span></p>
                <p className="text-gray-500 dark:text-gray-400">Méthode <span className="float-right text-gray-900 dark:text-white">{receiptPaymentMethodLabels[selectedReceipt.paymentMethod]}</span></p>
                <p className="text-gray-500 dark:text-gray-400">Date <span className="float-right text-gray-900 dark:text-white">{formatDateTime(selectedReceipt.issuedAt)}</span></p>
                <p className="text-gray-500 dark:text-gray-400">Montant <span className="float-right font-black text-gray-900 dark:text-white">{currencyFormatter.format(selectedReceipt.totalAmount)}</span></p>
                <p className="text-gray-500 dark:text-gray-400">Commission <span className="float-right font-bold text-orange-700 dark:text-orange-200">{currencyFormatter.format(selectedReceipt.commissionAmount)}</span></p>
                <p className="text-gray-500 dark:text-gray-400">Part owner <span className="float-right font-bold text-emerald-700 dark:text-emerald-200">{currencyFormatter.format(selectedReceipt.ownerAmount)}</span></p>
              </div>
            </div>

            <button type="button" disabled className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 font-bold text-gray-400 dark:text-gray-600">
              <Download className="h-4 w-4" /> Download PDF désactivé en mock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
