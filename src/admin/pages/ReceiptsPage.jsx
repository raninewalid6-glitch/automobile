import React, { useEffect, useMemo, useState } from "react";
import { Filter, Plus, ReceiptText, Search, X } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useLang } from "../../lib/i18n";

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

const inputClass = "w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/50";

export default function ReceiptsPage() {
  const { token } = useAdminAuth();
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ targetType: "booking", targetId: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAll = () => {
    Promise.all([
      apiFetch("/admin/receipts", { token }),
      apiFetch("/admin/bookings", { token }),
      apiFetch("/admin/purchases", { token }),
    ])
      .then(([receiptsData, bookingsData, purchasesData]) => {
        setReceipts(receiptsData.receipts);
        setBookings(bookingsData.bookings);
        setPurchases(purchasesData.purchases);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [token]);

  const filteredReceipts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return receipts.filter((receipt) => !searchValue || [receipt.receiptNumber, receipt.target.client, receipt.target.car]
      .join(" ")
      .toLowerCase()
      .includes(searchValue));
  }, [search, receipts]);

  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + (receipt.target.amount ?? 0), 0);

  const handleCreateReceipt = async (event) => {
    event.preventDefault();
    if (!form.targetId) {
      setFormError("Choisis une réservation ou une vente");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await apiFetch("/admin/receipts", {
        method: "POST",
        token,
        body: { [form.targetType === "booking" ? "bookingId" : "purchaseId"]: form.targetId },
      });
      setForm({ targetType: "booking", targetId: "" });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
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
              {t("admin.receipts.badge")}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{t("admin.receipts.title")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              {t("admin.receipts.subtitle")}
            </p>
          </div>
          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.02]"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {showForm ? t("admin.close") : t("admin.receipts.newReceipt")}
          </button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.receipts.issued")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{filteredReceipts.length}</p>
          </div>
          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
            <p className="text-sm text-orange-700 dark:text-orange-200">{t("admin.receipts.totalAmount")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totalAmount)}</p>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="rounded-[2rem] border border-orange-500/20 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.receipts.formTitle")}</h3>
          <form onSubmit={handleCreateReceipt} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <select className={inputClass} value={form.targetType} onChange={(event) => setForm({ targetType: event.target.value, targetId: "" })}>
              <option value="booking">{t("admin.payments.targetBooking")}</option>
              <option value="purchase">{t("admin.payments.targetPurchase")}</option>
            </select>
            <select className={`${inputClass}`} value={form.targetId} onChange={(event) => setForm({ ...form, targetId: event.target.value })} required>
              <option value="">{form.targetType === "booking" ? t("admin.payments.chooseBooking") : t("admin.payments.choosePurchase")}</option>
              {targetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 disabled:opacity-60"
            >
              {saving ? t("admin.receipts.generating") : t("admin.receipts.generate")}
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
          <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={t("admin.receipts.searchPh")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">{t("admin.receipts.loading")}</p>
        ) : filteredReceipts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <ReceiptText className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600" />
            <p className="mt-3 font-semibold">{t("admin.receipts.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">{t("admin.receipts.receiptNo")}</th>
                  <th className="py-4 font-semibold">Type</th>
                  <th className="py-4 font-semibold">{t("admin.th.client")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.vehicle")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.amount")}</th>
                  <th className="py-4 font-semibold">{t("admin.receipts.issuedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4 font-black text-gray-900 dark:text-white">{receipt.receiptNumber}</td>
                    <td className="py-4">{receipt.target.type === "booking" ? t("admin.payments.rental") : t("admin.payments.purchase")}</td>
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{receipt.target.client}</td>
                    <td className="py-4">{receipt.target.car}</td>
                    <td className="py-4 font-black text-gray-900 dark:text-white">{currencyFormatter.format(receipt.target.amount ?? 0)}</td>
                    <td className="py-4">{dateTimeFormatter.format(new Date(receipt.issuedAt))}</td>
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
