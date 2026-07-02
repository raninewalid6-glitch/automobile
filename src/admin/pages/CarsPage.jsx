import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, Pencil, Plus, Search, ShieldOff, ShoppingBag } from "lucide-react";
import { adminCars, carStatusLabels, carStatusStyles } from "../mock/adminCars.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("fr-FR");

function uniqueValues(key) {
  return [...new Set(adminCars.map((car) => car[key]).filter(Boolean))].sort();
}

function CarStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${carStatusStyles[status] ?? carStatusStyles.inactive}`}>
      {carStatusLabels[status] ?? status}
    </span>
  );
}

function getOfferType(car) {
  if (car.isForRent && car.isForSale) return "Location + Vente";
  if (car.isForRent) return "Location";
  if (car.isForSale) return "Vente";
  return "Non publié";
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
  const [filters, setFilters] = useState(initialFilters);
  const [cars, setCars] = useState(adminCars);

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

  const toggleStatus = (carId) => {
    setCars((currentCars) => currentCars.map((car) => {
      if (car.id !== carId || car.status === "sold") return car;
      return { ...car, status: car.status === "active" ? "inactive" : "active" };
    }));
  };

  const markAsSold = (carId) => {
    setCars((currentCars) => currentCars.map((car) => (car.id === carId ? { ...car, status: "sold", isForRent: false, isForSale: true } : car)));
  };

  const activeCount = cars.filter((car) => car.status === "active").length;
  const rentCount = cars.filter((car) => car.isForRent).length;
  const saleCount = cars.filter((car) => car.isForSale).length;

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion voitures mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Inventaire location & vente</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Recherchez, filtrez et pilotez les voitures à louer, à vendre ou disponibles sur les deux offres.
            </p>
          </div>
          <Link
            to="/admin/cars/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5" /> Nouvelle voiture
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Actives</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{activeCount}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">À louer</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{rentCount}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">À vendre</p>
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
              placeholder="Recherche marque, modèle, owner, plaque..."
              type="search"
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>

          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.status} onChange={(event) => handleFilterChange("status", event.target.value)}>
            <option value="all">Tous les statuts</option>
            {Object.entries(carStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">Toutes les villes</option>
            {uniqueValues("city").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.owner} onChange={(event) => handleFilterChange("owner", event.target.value)}>
            <option value="all">Tous les owners</option>
            {uniqueValues("owner").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.category} onChange={(event) => handleFilterChange("category", event.target.value)}>
            <option value="all">Toutes catégories</option>
            {uniqueValues("category").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.transmission} onChange={(event) => handleFilterChange("transmission", event.target.value)}>
            <option value="all">Transmission</option>
            {uniqueValues("transmission").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.fuelType} onChange={(event) => handleFilterChange("fuelType", event.target.value)}>
            <option value="all">Carburant</option>
            {uniqueValues("fuelType").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.rent} onChange={(event) => handleFilterChange("rent", event.target.value)}>
            <option value="all">Location: tous</option>
            <option value="yes">Location: oui</option>
            <option value="no">Location: non</option>
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.sale} onChange={(event) => handleFilterChange("sale", event.target.value)}>
            <option value="all">Vente: tous</option>
            <option value="yes">Vente: oui</option>
            <option value="no">Vente: non</option>
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-4 shadow-2xl shadow-black/25 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Voitures ({filteredCars.length})</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Actions locales mock sans backend.</p>
          </div>
          <button className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => setFilters(initialFilters)}>
            Reset filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="text-gray-500 dark:text-gray-400">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-4 font-semibold">Image</th>
                <th className="py-4 font-semibold">Marque</th>
                <th className="py-4 font-semibold">Modèle</th>
                <th className="py-4 font-semibold">Owner</th>
                <th className="py-4 font-semibold">Ville</th>
                <th className="py-4 font-semibold">Location/jour</th>
                <th className="py-4 font-semibold">Prix vente</th>
                <th className="py-4 font-semibold">Type</th>
                <th className="py-4 font-semibold">Statut</th>
                <th className="py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                  <td className="py-4">
                    <img src={car.images[0]} alt={car.title} className="h-14 w-20 rounded-2xl object-cover" />
                  </td>
                  <td className="py-4 font-bold text-gray-900 dark:text-white">{car.brand}</td>
                  <td className="py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{car.model}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{car.year} · {numberFormatter.format(car.mileage)} km</p>
                  </td>
                  <td className="py-4">{car.owner}</td>
                  <td className="py-4">{car.city}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{car.rentPricePerDay ? currencyFormatter.format(car.rentPricePerDay) : "—"}</td>
                  <td className="py-4 font-semibold text-gray-900 dark:text-white">{car.salePrice ? currencyFormatter.format(car.salePrice) : "—"}</td>
                  <td className="py-4">{getOfferType(car)}</td>
                  <td className="py-4"><CarStatusBadge status={car.status} /></td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/cars/${car.id}`} className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" title="Voir">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link to="/admin/cars/new" className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-orange-500/30 hover:text-gray-900 dark:hover:text-white" title="Modifier mock">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-emerald-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => toggleStatus(car.id)} title="Activer/désactiver">
                        {car.status === "active" ? <ShieldOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <button className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => markAsSold(car.id)} title="Marquer vendu">
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
