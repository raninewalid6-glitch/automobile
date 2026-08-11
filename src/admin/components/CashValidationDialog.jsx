import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { paymentMethodLabels } from "../lib/paymentOptions";
import { useLang } from "../../lib/i18n";

const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

export default function CashValidationDialog({ payment, open, onClose, onConfirm }) {
  const [note, setNote] = useState("");
  const { t } = useLang();

  if (!open || !payment) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(payment.id, note.trim());
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cash-validation-title">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-200">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-700 dark:text-orange-200">{t("admin.cash.eyebrow")}</p>
              <h3 id="cash-validation-title" className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{t("admin.cash.title")}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-black/10 dark:border-white/10 p-2 text-gray-500 dark:text-gray-400 transition hover:border-red-500/40 hover:text-gray-900 dark:hover:text-white" aria-label={t("admin.close")}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Payment ID</p>
              <p className="mt-1 font-black text-gray-900 dark:text-white">{payment.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Booking/Purchase</p>
              <p className="mt-1 font-black text-gray-900 dark:text-white">{payment.relatedId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t("admin.th.client")}</p>
              <p className="mt-1 font-black text-gray-900 dark:text-white">{payment.client}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t("admin.th.amount")}</p>
              <p className="mt-1 font-black text-gray-900 dark:text-white">{currencyFormatter.format(payment.amount)}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-orange-700 dark:text-orange-100">
            {t("admin.th.method")} {paymentMethodLabels[payment.method]} · {t("admin.th.ref")} {payment.providerRef}
          </p>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{t("admin.cash.noteLabel")}</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-3xl border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-black/40 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-orange-500/50"
            placeholder={t("admin.cash.notePh")}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-2xl border border-black/10 dark:border-white/10 px-5 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 transition hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white">
            {t("admin.cash.cancel")}
          </button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.01]">
            <CheckCircle2 className="h-4 w-4" /> {t("admin.cash.confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}
