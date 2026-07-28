import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Plus, Search, UserRoundCheck, UsersRound, X } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

const roleLabels = {
  OWNER: "Propriétaire",
  SUPERADMIN: "Super Admin",
  MANAGER: "Manager",
  CLIENT: "Client",
};

const initialFilters = {
  search: "",
  city: "all",
  commission: "all",
};

const emptyOwnerForm = {
  fullName: "",
  email: "",
  phone: "",
  city: "Djibouti",
  password: "",
};

const inputClass = "w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/50";

export default function OwnersPage() {
  const { token } = useAdminAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [ownerForm, setOwnerForm] = useState(emptyOwnerForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadOwners = () => {
    apiFetch("/admin/owners", { token })
      .then((data) => setOwners(data.owners))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadOwners, [token]);

  const uniqueValues = (key) => [...new Set(owners.map((owner) => owner[key]).filter(Boolean))].sort();

  const filteredOwners = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return owners.filter((owner) => {
      const matchesSearch = !searchValue || [owner.name, owner.phone, owner.email, owner.city]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesCity = filters.city === "all" || owner.city === filters.city;
      const matchesCommission = filters.commission === "all" || (filters.commission === "due" ? owner.metrics.commission > 0 : owner.metrics.commission === 0);

      return matchesSearch && matchesCity && matchesCommission;
    });
  }, [filters, owners]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleCreateOwner = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await apiFetch("/admin/owners", { method: "POST", token, body: ownerForm });
      setOwnerForm(emptyOwnerForm);
      setShowForm(false);
      loadOwners();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totals = owners.reduce((accumulator, owner) => ({
    revenue: accumulator.revenue + owner.metrics.revenue,
    commission: accumulator.commission + owner.metrics.commission,
    cars: accumulator.cars + owner.metrics.totalCars,
  }), { revenue: 0, commission: 0, cars: 0 });

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Gestion propriétaires
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Propriétaires & partenaires</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Profils propriétaires, parcs voitures, réservations et revenus — calculés en direct depuis la base.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-700 dark:text-orange-100">
              <UsersRound className="h-6 w-6" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-200">Total</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{owners.length} propriétaires</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:scale-[1.02]"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showForm ? "Fermer" : "Nouveau propriétaire"}
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Voitures gérées</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{numberFormatter.format(totals.cars)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenus reversés</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.revenue)}</p>
          </div>
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Commission plateforme</p>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totals.commission)}</p>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="rounded-[2rem] border border-orange-500/20 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Créer un compte propriétaire</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Le propriétaire pourra se connecter avec cet email et ce mot de passe. Ses voitures lui seront rattachées.
          </p>
          <form onSubmit={handleCreateOwner} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input className={inputClass} placeholder="Nom complet / société *" value={ownerForm.fullName} onChange={(event) => setOwnerForm({ ...ownerForm, fullName: event.target.value })} required />
            <input className={inputClass} type="email" placeholder="Email *" value={ownerForm.email} onChange={(event) => setOwnerForm({ ...ownerForm, email: event.target.value })} required />
            <input className={inputClass} type="tel" placeholder="Téléphone" value={ownerForm.phone} onChange={(event) => setOwnerForm({ ...ownerForm, phone: event.target.value })} />
            <input className={inputClass} placeholder="Ville" value={ownerForm.city} onChange={(event) => setOwnerForm({ ...ownerForm, city: event.target.value })} />
            <input className={inputClass} type="password" placeholder="Mot de passe * (min 6 caractères)" value={ownerForm.password} onChange={(event) => setOwnerForm({ ...ownerForm, password: event.target.value })} required />
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/25 disabled:opacity-60"
            >
              {saving ? "Création..." : "Créer le propriétaire"}
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-gray-500 dark:text-gray-400 xl:col-span-2">
            <Search className="h-4 w-4" />
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Recherche nom, téléphone, email, ville..."
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
            />
          </label>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.city} onChange={(event) => handleFilterChange("city", event.target.value)}>
            <option value="all">Toutes villes</option>
            {uniqueValues("city").map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white" value={filters.commission} onChange={(event) => handleFilterChange("commission", event.target.value)}>
            <option value="all">Commissions: toutes</option>
            <option value="due">Avec commission</option>
            <option value="clear">Sans commission</option>
          </select>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-4 shadow-2xl shadow-black/25 lg:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Propriétaires ({filteredOwners.length})</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Données en direct depuis ta base Neon.</p>
          </div>
          <button className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" onClick={() => setFilters(initialFilters)}>
            Reset filtres
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement des propriétaires...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="text-gray-500 dark:text-gray-400">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-4 font-semibold">Nom</th>
                  <th className="py-4 font-semibold">Téléphone</th>
                  <th className="py-4 font-semibold">Email</th>
                  <th className="py-4 font-semibold">Ville</th>
                  <th className="py-4 font-semibold">Voitures location</th>
                  <th className="py-4 font-semibold">Voitures vente</th>
                  <th className="py-4 font-semibold">Réservations</th>
                  <th className="py-4 font-semibold">Revenus</th>
                  <th className="py-4 font-semibold">Commission</th>
                  <th className="py-4 font-semibold">Rôle</th>
                  <th className="py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map((owner) => (
                  <tr key={owner.id} className="border-b border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 last:border-0">
                    <td className="py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{owner.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{owner.metrics.totalCars} voiture{owner.metrics.totalCars > 1 ? "s" : ""}</p>
                    </td>
                    <td className="py-4">{owner.phone || "—"}</td>
                    <td className="py-4">{owner.email}</td>
                    <td className="py-4">{owner.city || "—"}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.rentalCars)}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.saleCars)}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{numberFormatter.format(owner.metrics.reservations)}</td>
                    <td className="py-4 font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(owner.metrics.revenue)}</td>
                    <td className="py-4 font-semibold text-orange-700 dark:text-orange-200">{currencyFormatter.format(owner.metrics.commission)}</td>
                    <td className="py-4">
                      <span className="inline-flex rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-3 py-1 text-xs font-bold">
                        {roleLabels[owner.role] ?? owner.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/owners/${owner.id}`} className="rounded-xl border border-black/10 dark:border-white/10 p-2 text-gray-600 dark:text-gray-300 hover:border-red-500/30 hover:text-gray-900 dark:hover:text-white" title="Voir">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOwners.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <UserRoundCheck className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600" />
            <p className="mt-3 font-semibold">Aucun propriétaire ne correspond aux filtres.</p>
          </div>
        )}
      </section>
    </div>
  );
}
