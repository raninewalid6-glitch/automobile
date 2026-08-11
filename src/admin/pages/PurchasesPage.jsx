import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, Filter, Flag, Search, ShoppingCart, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { purchaseStatusLabels, purchaseStatusStyles } from "../lib/purchaseOptions";
import { useLang } from "../../lib/i18n";

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
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${purchaseStatusStyles[status] ?? purchaseStatusStyles.PENDING}`}>
      {purchaseStatusLabels[status] ?? status}
    </span>
  );
}

export default function PurchasesPage() {
  const { token } = useAdminAuth();
  const { t } = useLang();
  const [filters, setFilters] = useState(initialFilters);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/purchases", { token })
      .then((data) => setPurchases(data.purchases))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const uniqueValues = (selector) => [...new Set(purchases.map(selector).filter(Boolean))].sort();

  const filteredPurchases = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const matchesSearch = !searchValue || [purchase.id, purchase.client.name, purchase.client.phone, purchase.car.title, purchase.car.plateNumber, purchase.owner.name]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesStatus = filters.status === "all" || purchase.status === filters.status;
      const matchesCity = filters.city === "all" || purchase.car.city === filters.city;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [filters, purchases]);

  const totals = filteredPurchases.reduce((accumulator, purchase) => ({
    amount: accumulator.amount + purchase.price,
    completed: accumulator.completed + (purchase.status === "COMPLETED" ? 1 : 0),
    pending: accumulator.pending + (purchase.status === "PENDING" ? 1 : 0),
  }), { amount: 0, completed: 0, pending: 0 });

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const updateStatus = async (purchase, status) => {
    if (status === "COMPLETED" && !window.confirm(t("admin.purchases.confirmFinalize"))) {
      return;
    }
    try {
      const data = await apiFetch(`/admin/purchases/${purchase.id}/status`, { method: "PUT", token, body: { status } });
      setPurchases((current) => current.map((item) => (item.id === purchase.id ? data.purchase : item)));
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
              {t("admin.purchases.badge")}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{t("admin.purchases.title")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              {t("admin.purchases.subtitle")}
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
            <ShoppingCart className="h-6 w-6" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">{t("admin.purchases.totalFiltered")}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredPurchases.length} {t("admin.purchases.requests")}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.purchases.requestValue")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.amount)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.purchases.pending")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{totals.pending}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.purchases.completed")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{totals.completed}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          {t("admin.purchases.filterTitle")}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={t("admin.purchases.searchPh")}
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">{t("admin.purchases.allStatuses")}</option>
            {Object.entries(purchaseStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">{t("admin.purchases.allCities")}</option>
            {uniqueValues((purchase) => purchase.car.city).map((value) => <option key={value} value={value}>{value}</option>)}
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
          <p className="py-12 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">{t("admin.purchases.loading")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">{t("admin.th.ref")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.client")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.vehicle")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.owner")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.price")}</th>
                  <th className="py-4 font-semibold">{t("admin.purchases.requestedOn")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.status")}</th>
                  <th className="py-4 text-right font-semibold">{t("admin.th.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4 font-black text-gray-900 dark:text-white">{purchase.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{purchase.client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.client.phone || purchase.client.email}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{purchase.car.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{purchase.car.city} · {purchase.car.plateNumber}</p>
                    </td>
                    <td className="py-4">{purchase.owner.name}</td>
                    <td className="py-4 font-black text-gray-900 dark:text-white">{currencyFormatter.format(purchase.price)}</td>
                    <td className="py-4">{dateFormatter.format(new Date(purchase.createdAt))}</td>
                    <td className="py-4"><StatusBadge status={purchase.status} /></td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {purchase.status === "PENDING" && (
                          <button
                            className="rounded-xl border border-emerald-500/30 p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => updateStatus(purchase, "ACCEPTED")}
                            title={t("admin.purchases.accept")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {purchase.status === "ACCEPTED" && (
                          <button
                            className="rounded-xl border border-blue-500/30 p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => updateStatus(purchase, "COMPLETED")}
                            title={t("admin.purchases.finalize")}
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        )}
                        {(purchase.status === "PENDING" || purchase.status === "ACCEPTED") && (
                          <button
                            className="rounded-xl border border-red-500/30 p-2 text-red-700 dark:text-red-300 hover:bg-red-500/10"
                            onClick={() => updateStatus(purchase, "REJECTED")}
                            title={t("admin.purchases.reject")}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <Link className="inline-flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 px-3 py-2 font-bold text-gray-900 dark:text-white transition hover:border-red-500/50 hover:bg-red-500/10" to={`/admin/purchases/${purchase.id}`}>
                          <Eye className="h-4 w-4" /> {t("admin.details")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPurchases.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">{t("admin.purchases.empty")}</div>
        )}
      </section>
    </div>
  );
}
