import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CarFront, CheckCircle2, Gauge, MapPin, Pencil, ShieldCheck, ShoppingCart, UserRound, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  carStatusLabels,
  carStatusStyles,
  transmissionLabels,
  fuelTypeLabels,
  categoryLabels,
} from "../lib/carOptions";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const numberFormatter = new Intl.NumberFormat("fr-FR");

function InfoCard({ icon, label, value }) {
  const IconComponent = icon;

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <IconComponent className="h-5 w-5 text-orange-700 dark:text-orange-300" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-lg font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function BooleanLine({ active, label }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      {active ? <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" /> : <XCircle className="h-5 w-5 text-red-700 dark:text-red-300" />}
    </div>
  );
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const { token } = useAdminAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/admin/cars/${id}`, { token })
      .then((data) => setCar(data.car))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement de la voiture...</p>
    );
  }

  if (!car) {
    return (
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Voiture introuvable</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{error || `Aucune voiture ne correspond à l'identifiant ${id}.`}</p>
        <Link to="/admin/cars" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white">
          Retour au listing
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 shadow-2xl shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[360px]">
            {car.images[0] ? (
              <img src={car.images[0]} alt={car.title} className="h-full min-h-[360px] w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-sm font-bold text-gray-400">
                Aucune photo
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <Link to="/admin/cars" className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
            <Link to={`/admin/cars/${car.id}/edit`} className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <Pencil className="h-4 w-4" /> Modifier
            </Link>
          </div>
          <div className="p-6 lg:p-8">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${carStatusStyles[car.status] ?? carStatusStyles.INACTIVE}`}>
              {carStatusLabels[car.status] ?? car.status}
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{car.title}</h2>
            <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {car.brand} {car.model} · {car.year} · {categoryLabels[car.category] ?? car.category} · plaque {car.plateNumber}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <BooleanLine active={car.isForRent} label="Disponible location" />
              <BooleanLine active={car.isForSale} label="Disponible vente" />
              <BooleanLine active={car.airConditioning} label="Climatisation" />
              <BooleanLine active={car.status === "ACTIVE"} label="Visible catalogue" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={CarFront} label="Transmission" value={transmissionLabels[car.transmission] ?? car.transmission} />
        <InfoCard icon={Gauge} label="Kilométrage" value={car.mileage != null ? `${numberFormatter.format(car.mileage)} km` : "—"} />
        <InfoCard icon={CalendarDays} label="Année" value={car.year} />
        <InfoCard icon={MapPin} label="Ville" value={car.city} />
      </section>

      <section className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-7">
          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Photos</h3>
            {car.images.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {car.images.map((image) => (
                  <img key={image} src={image} alt={car.title} className="h-48 w-full rounded-3xl object-cover" />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">Aucune photo enregistrée pour cette voiture.</p>
            )}
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Owner</h3>
            <div className="mt-5 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
                  <UserRound className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{car.owner}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gestionnaire / propriétaire</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-gray-500 dark:text-gray-400">
                Adresse de retrait: {car.address ? `${car.address}, ` : ""}{car.city}.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-7">
          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pricing</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-200">Location / jour</p>
                <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{car.rentPricePerDay ? currencyFormatter.format(car.rentPricePerDay) : "—"}</p>
              </div>
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="text-sm font-semibold text-red-700 dark:text-red-200">Prix vente</p>
                <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{car.salePrice ? currencyFormatter.format(car.salePrice) : "—"}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Caution</p>
                <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{car.depositAmount != null ? currencyFormatter.format(car.depositAmount) : "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Disponibilité & vente</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard icon={ShoppingCart} label="Canal vente" value={car.isForSale ? "Publié à la vente" : "Non publié"} />
              <InfoCard icon={ShieldCheck} label="Assurance" value={car.insurance || "—"} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <BooleanLine active={car.isForRent && car.status === "ACTIVE"} label="Réservable maintenant" />
              <BooleanLine active={car.isForSale && car.status === "ACTIVE"} label="Demande d'achat possible" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fiche complète</h3>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Marque", car.brand],
                ["Modèle", car.model],
                ["Couleur", car.color || "—"],
                ["Carburant", fuelTypeLabels[car.fuelType] ?? car.fuelType],
                ["Places", car.seats],
                ["Portes", car.doors],
                ["Plaque", car.plateNumber],
                ["Catégorie", categoryLabels[car.category] ?? car.category],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="mt-2 font-bold text-gray-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </section>
    </div>
  );
}
