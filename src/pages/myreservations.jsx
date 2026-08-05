import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ShoppingCart } from "lucide-react";
import Footer from "../components/footer";
import { useAuth } from "../context/userContext";
import { apiFetch } from "../lib/api";
import { bookingStatusStyles } from "../admin/lib/bookingOptions";
import { purchaseStatusStyles } from "../admin/lib/purchaseOptions";
import { useLang } from "../lib/i18n";

const currencyFormatter = new Intl.NumberFormat("fr-FR");

const localeMap = { fr: "fr-FR", en: "en-GB", ar: "ar-DJ", so: "so-DJ" };

function formatDate(value, lang) {
  return new Intl.DateTimeFormat(localeMap[lang] || "fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function Badge({ label, style }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style}`}>
      {label}
    </span>
  );
}

export default function MyReservations() {
  const { isAuthenticated, user, token } = useAuth();
  const { t, lang } = useLang();
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch("/bookings/me", { token }),
      apiFetch("/purchases/me", { token }),
    ])
      .then(([bookingsData, purchasesData]) => {
        setBookings(bookingsData.bookings);
        setPurchases(purchasesData.purchases);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <section className="pt-24 sm:pt-32 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            {t("myresa.title1")} <span className="text-red-500">{t("myresa.title2")}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {isAuthenticated ? `${t("nav.hello")} ${user?.prenom}, ${t("myresa.greeting")}` : t("myresa.loginPrompt")}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 space-y-10">
        {!isAuthenticated ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t("myresa.notConnected1")}{" "}
              <Link to="/cars" className="font-semibold text-red-500 hover:underline">{t("nav.cars")}</Link>{" "}
              {t("myresa.notConnected2")}
            </p>
          </div>
        ) : loading ? (
          <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">{t("myresa.loading")}</p>
        ) : error ? (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 text-center">
            {error}
          </p>
        ) : (
          <>
            {/* Locations */}
            <section>
              <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold">
                <CalendarDays className="h-6 w-6 text-red-500" />
                {t("myresa.rentals")} ({bookings.length})
              </h2>
              {bookings.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">
                  {t("myresa.noRentals")}{" "}
                  <Link to="/cars" className="font-semibold text-red-500 hover:underline">{t("myresa.discover")}</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 sm:flex-row sm:items-center transition-colors duration-300">
                      {booking.car.image ? (
                        <img src={booking.car.image} alt={booking.car.title} className="h-24 w-full sm:w-36 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-24 w-full sm:w-36 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-500">
                          {t("myresa.noPhoto")}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{booking.car.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("resa.from")} {formatDate(booking.startDate, lang)} {t("resa.to").toLowerCase()} {formatDate(booking.endDate, lang)} · {booking.days} {t("resa.days")}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-orange-500">
                          {currencyFormatter.format(booking.car.pricePerDay)} FDJ/jour
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-xl font-bold text-red-500">{currencyFormatter.format(booking.totalAmount)} FDJ</p>
                        <Badge
                          label={t(`status.${booking.status}`) !== `status.${booking.status}` ? t(`status.${booking.status}`) : booking.status}
                          style={bookingStatusStyles[booking.status] ?? bookingStatusStyles.PENDING}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Demandes d'achat */}
            <section>
              <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold">
                <ShoppingCart className="h-6 w-6 text-red-500" />
                {t("myresa.purchases")} ({purchases.length})
              </h2>
              {purchases.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">
                  {t("myresa.noPurchases")}
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 sm:flex-row sm:items-center transition-colors duration-300">
                      {purchase.car.image ? (
                        <img src={purchase.car.image} alt={purchase.car.title} className="h-24 w-full sm:w-36 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-24 w-full sm:w-36 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-500">
                          {t("myresa.noPhoto")}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{purchase.car.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("myresa.sentOn")} {new Date(purchase.createdAt).toLocaleDateString(localeMap[lang] || "fr-FR")}
                        </p>
                        {purchase.note && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic truncate">« {purchase.note} »</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-xl font-bold text-red-500">{currencyFormatter.format(purchase.price)} FDJ</p>
                        <Badge
                          label={t(`pstatus.${purchase.status}`) !== `pstatus.${purchase.status}` ? t(`pstatus.${purchase.status}`) : purchase.status}
                          style={purchaseStatusStyles[purchase.status] ?? purchaseStatusStyles.PENDING}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
