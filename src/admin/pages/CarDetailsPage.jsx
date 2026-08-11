import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CarFront, CheckCircle2, Gauge, MapPin, Pencil, ShieldCheck, ShoppingCart, UserRound, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
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
  const { t } = useLang();

  useEffect(() => {
    apiFetch(`/admin/cars/${id}`, { token })
      .then((data) => setCar(data.car))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">{t("admin.carDetail.loading")}</p>
    );
  }

  if (!car) {
    return (
      <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">{t("admin.carDetail.notFound")}</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{error || `${t("admin.carDetail.notFoundMsg")} ${id}.`}</p>
        <Link to="/admin/cars" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 text-sm font-black text-white">
          {t("admin.carDetail.backToList")}
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
                {t("admin.carDetail.noPhoto")}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <Link to="/admin/cars" className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <ArrowLeft className="h-4 w-4" /> {t("admin.carDetail.back")}
            </Link>
            <Link to={`/admin/cars/${car.id}/edit`} className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <Pencil className="h-4 w-4" /> {t("admin.carDetail.edit")}
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
              <BooleanLine active={car.isForRent} label={t("admin.carDetail.availableRent")} />
              <BooleanLine active={car.isForSale} label={t("admin.carDetail.availableSale")} />
              <BooleanLine active={car.airConditioning} label={t("admin.carDetail.airConditioning")} />
              <BooleanLine active={car.status === "ACTIVE"} label={t("admin.carDetail.visibleCatalog")} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={CarFront} label={t("admin.carDetail.transmission")} value={transmissionLabels[car.transmission] ?? car.transmission} />
        <InfoCard icon={Gauge} label={t("admin.carDetail.mileage")} value={car.mileage != null ? `${numberFormatter.format(car.mileage)} km` : "—"} />
        <InfoCard icon={CalendarDays} label={t("admin.carDetail.year")} value={car.year} />
        <InfoCard icon={MapPin} label={t("admin.carDetail.city")} value={car.city} />
      </section>

      <section className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-7">
          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.carDetail.photos")}</h3>
            {car.images.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {car.images.map((image) => (
                  <img key={image} src={image} alt={car.title} className="h-48 w-full rounded-3xl object-cover" />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">{t("admin.carDetail.noPhotos")}</p>
            )}
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.carDetail.ownerSection")}</h3>
            <div className="mt-5 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
                  <UserRound className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{car.owner}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.carDetail.managerOwner")}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-gray-500 dark:text-gray-400">
                {t("admin.carDetail.pickupAddress")} {car.address ? `${car.address}, ` : ""}{car.city}.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-7">
          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.carDetail.pricing")}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-200">{t("admin.carDetail.rentPerDay")}</p>
                <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{car.rentPricePerDay ? currencyFormatter.format(car.rentPricePerDay) : "—"}</p>
              </div>
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="text-sm font-semibold text-red-700 dark:text-red-200">{t("admin.carDetail.salePrice")}</p>
                <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{car.salePrice ? currencyFormatter.format(car.salePrice) : "—"}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t("admin.carDetail.deposit")}</p>
                <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{car.depositAmount != null ? currencyFormatter.format(car.depositAmount) : "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.carDetail.availabilityAndSale")}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard icon={ShoppingCart} label={t("admin.carDetail.saleChannel")} value={car.isForSale ? t("admin.carDetail.publishedForSale") : t("admin.carDetail.unpublished")} />
              <InfoCard icon={ShieldCheck} label={t("admin.carDetail.insurance")} value={car.insurance || "—"} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <BooleanLine active={car.isForRent && car.status === "ACTIVE"} label={t("admin.carDetail.bookableNow")} />
              <BooleanLine active={car.isForSale && car.status === "ACTIVE"} label={t("admin.carDetail.purchaseRequestPossible")} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("admin.carDetail.fullDetails")}</h3>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                [t("admin.carDetail.brand"), car.brand],
                [t("admin.carDetail.model"), car.model],
                [t("admin.carDetail.color"), car.color || "—"],
                [t("admin.carDetail.fuel"), fuelTypeLabels[car.fuelType] ?? car.fuelType],
                [t("admin.carDetail.seats"), car.seats],
                [t("admin.carDetail.doors"), car.doors],
                [t("admin.carDetail.plate"), car.plateNumber],
                [t("admin.carDetail.category"), categoryLabels[car.category] ?? car.category],
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
