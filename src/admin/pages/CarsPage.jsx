import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, Pencil, Plus, Search, ShieldOff, Trash2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useLang } from "../../lib/i18n";
import {
  carStatusLabels,
  carStatusStyles,
  transmissionLabels,
  fuelTypeLabels,
  categoryLabels,
} from "../lib/carOptions";

const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

function CarStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${carStatusStyles[status] ?? carStatusStyles.INACTIVE}`}>
      {carStatusLabels[status] ?? status}
    </span>
  );
}

const initialFilters = {
  search: "",
  status: "all",
  city: "all",
  owner: "all",
  category: "all",
  transmission: "all",
  fuelType: "all",
  rent: "all",
  sale: "all",
};

export default function CarsPage() {
  const { token } = useAdminAuth();
  const { t } = useLang();
  const [filters, setFilters] = useState(initialFilters);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/admin/cars", { token })
      .then((data) => {
        if (!cancelled) setCars(data.cars);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const uniqueValues = (key) => [...new Set(cars.map((car) => car[key]).filter(Boolean))].sort();

  const filteredCars = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return cars.filter((car) => {
      const matchesSearch = !searchValue || [car.title, car.brand, car.model, car.owner, car.city, car.plateNumber]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesStatus = filters.status === "all" || car.status === filters.status;
      const matchesCity = filters.city === "all" || car.city === filters.city;
      const matchesOwner = filters.owner === "all" || car.owner === filters.owner;
      const matchesCategory = filters.category === "all" || car.category === filters.category;
      const matchesTransmission = filters.transmission === "all" || car.transmission === filters.transmission;
      const matchesFuel = filters.fuelType === "all" || car.fuelType === filters.fuelType;
      const matchesRent = filters.rent === "all" || car.isForRent === (filters.rent === "yes");
      const matchesSale = filters.sale === "all" || car.isForSale === (filters.sale === "yes");

      return matchesSearch && matchesStatus && matchesCity && matchesOwner && matchesCategory && matchesTransmission && matchesFuel && matchesRent && matchesSale;
    });
  }, [cars, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const getOfferType = (car) => {
    if (car.isForRent && car.isForSale) return t("admin.cars.offerRentSale");
    if (car.isForRent) return t("admin.cars.offerRent");
    if (car.isForSale) return t("admin.cars.offerSale");
    return t("admin.cars.offerNone");
  };

  const toggleStatus = async (car) => {
    const nextStatus = car.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const data = await apiFetch(`/admin/cars/${car.id}`, { method: "PUT", token, body: { status: nextStatus } });
      setCars((currentCars) => currentCars.map((item) => (item.id === car.id ? data.car : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCar = async (car) => {
    if (!window.confirm(t("admin.cars.confirmDelete"))) return;
    try {
      await apiFetch(`/admin/cars/${car.id}`, { method: "DELETE", token });
      setCars((currentCars) => currentCars.filter((item) => item.id !== car.id));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const activeCount = cars.filter((car) => car.status === "ACTIVE").length;
  const rentCount = cars.filter((car) => car.isForRent).length;
  const saleCount = cars.filter((car) => car.isForSale).length;

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              {t("admin.cars.badge")}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{t("admin.cars.title")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              {t("admin.cars.subtitle")}
            </p>
          </div>
          <Link
            to="/admin/cars/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5" /> {t("admin.cars.newCar")}
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.cars.active")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{activeCount}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.cars.forRent")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{rentCount}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.cars.forSale")}</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{saleCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/25">
        <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-5">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 lg:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={t("admin.cars.searchPh")}
              type="search"
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>

          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">{t("admin.cars.allStatuses")}</option>
            {Object.entries(carStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">{t("admin.cars.allCities")}</option>
            {uniqueValues("city").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.owner} onChange={(event) => handleFilterChange("owner", event.target.value)}>
            <option value="all">{t("admin.cars.allOwners")}</option>
            {uniqueValues("owner").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.category} onChange={(event) => handleFilterChange("category", event.target.value)}>
            <option value="all">{t("admin.cars.allCategories")}</option>
            {uniqueValues("category").map((value) => <option key={value} value={value}>{categoryLabels[value] ?? value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.transmission} onChange={(event) => handleFilterChange("transmission", event.target.value)}>
            <option value="all">Transmission</option>
            {uniqueValues("transmission").map((value) => <option key={value} value={value}>{transmissionLabels[value] ?? value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.fuelType} onChange={(event) => handleFilterChange("fuelType", event.target.value)}>
            <option value="all">{t("admin.cars.fuelType")}</option>
            {uniqueValues("fuelType").map((value) => <option key={value} value={value}>{fuelTypeLabels[value] ?? value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.rent} onChange={(event) => handleFilterChange("rent", event.target.value)}>
            <option value="all">{t("admin.cars.rentAll")}</option>
            <option value="yes">{t("admin.cars.rentYes")}</option>
            <option value="no">{t("admin.cars.rentNo")}</option>
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.sale} onChange={(event) => handleFilterChange("sale", event.target.value)}>
            <option value="all">{t("admin.cars.saleAll")}</option>
            <option value="yes">{t("admin.cars.saleYes")}</option>
            <option value="no">{t("admin.cars.saleNo")}</option>
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-4 shadow-2xl shadow-black/25 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.cars.count")} ({filteredCars.length})</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.liveData")}</p>
          </div>
          <button className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => setFilters(initialFilters)}>
            {t("admin.resetFilters")}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">{t("admin.cars.loading")}</p>
        ) : filteredCars.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
            {t("admin.cars.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">{t("admin.th.image")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.brand")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.model")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.owner")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.city")}</th>
                  <th className="py-4 font-semibold">{t("admin.cars.rentDay")}</th>
                  <th className="py-4 font-semibold">{t("admin.cars.salePrice")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.type")}</th>
                  <th className="py-4 font-semibold">{t("admin.th.status")}</th>
                  <th className="py-4 text-right font-semibold">{t("admin.th.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4">
                      {car.images[0] ? (
                        <img src={car.images[0]} alt={car.title} className="h-14 w-20 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-black/10 text-xs font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400">
                          {t("admin.noImage")}
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-bold text-gray-900 dark:text-white">{car.brand}</td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{car.model}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {car.year}{car.mileage != null ? ` · ${numberFormatter.format(car.mileage)} km` : ""}
                      </p>
                    </td>
                    <td className="py-4">{car.owner}</td>
                    <td className="py-4">{car.city}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{car.rentPricePerDay ? currencyFormatter.format(car.rentPricePerDay) : "—"}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{car.salePrice ? currencyFormatter.format(car.salePrice) : "—"}</td>
                    <td className="py-4">{getOfferType(car)}</td>
                    <td className="py-4"><CarStatusBadge status={car.status} /></td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/cars/${car.id}`} className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" title={t("admin.details")}>
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link to={`/admin/cars/${car.id}/edit`} className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white" title={t("admin.edit")}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-emerald-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => toggleStatus(car)}>
                          {car.status === "ACTIVE" ? <ShieldOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <button className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => deleteCar(car)} title={t("admin.delete")}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
