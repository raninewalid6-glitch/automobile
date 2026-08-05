import React, { useEffect, useState } from "react";
import { X, Gauge, Zap, Settings, Fuel, Users, Check, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/userContext";
import { apiFetch } from "../lib/api";
import { useLang } from "../lib/i18n";

export default function CarDetailsModal({
  showModal,
  setShowModal,
  selectedCar,
  onReserve,
  onLoginRequired,
}) {
  const { isAuthenticated, token } = useAuth();
  const { t } = useLang();
  const [purchaseState, setPurchaseState] = useState({ sending: false, done: false, error: "" });

  // Réinitialise l'état de la demande d'achat quand on change de voiture
  useEffect(() => {
    setPurchaseState({ sending: false, done: false, error: "" });
  }, [selectedCar?.id]);

  // Bloque le défilement de la page derrière la fenêtre (évite la double barre de défilement)
  useEffect(() => {
    if (!showModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  const handlePurchaseRequest = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    setPurchaseState({ sending: true, done: false, error: "" });
    try {
      await apiFetch("/purchases", { method: "POST", token, body: { carId: selectedCar.id } });
      setPurchaseState({ sending: false, done: true, error: "" });
    } catch (err) {
      setPurchaseState({ sending: false, done: false, error: err.message });
    }
  };

  if (!showModal || !selectedCar) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl max-w-5xl w-full border border-gray-200 dark:border-gray-700 relative my-8 transition-colors duration-300">

        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white z-10 bg-gray-100 dark:bg-black/50 rounded-full p-2 backdrop-blur-sm transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Gauche - Images */}
          <div>
            <div className="relative mb-4">
              <img
                src={selectedCar.image}
                alt={selectedCar.name}
                className="w-full h-80 object-cover rounded-xl"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {selectedCar.category}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(selectedCar.images?.length ? selectedCar.images : [selectedCar.image]).slice(0, 3).map((imageUrl, i) => (
                <img
                  key={i}
                  src={imageUrl}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg opacity-70 hover:opacity-100 transition cursor-pointer border-2 border-transparent hover:border-red-500"
                />
              ))}
            </div>
          </div>

          {/* Droite - Infos */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-2">{selectedCar.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {selectedCar.brand} • {selectedCar.year}
              </p>
              {selectedCar.description && (
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {selectedCar.description}
                </p>
              )}
            </div>

            {/* Prix */}
            <div className="bg-red-50 dark:bg-gradient-to-r dark:from-red-600/20 dark:to-orange-600/20 border border-red-200 dark:border-red-600/30 rounded-xl p-4 mb-6 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("details.buyPrice")}</div>
                  <div className="text-3xl font-bold text-red-500">
                    {selectedCar.price != null ? `${selectedCar.price.toLocaleString()} FDJ` : "—"}
                  </div>
                </div>
                {selectedCar.pricePerDay && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("details.rentPerDay")}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCar.pricePerDay} FDJ
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-red-500" />
                {t("details.specs")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Gauge className="w-5 h-5 text-red-500" />, label: t("details.power"), value: selectedCar.specs.power },
                  { icon: <Zap className="w-5 h-5 text-red-500" />, label: t("details.accel"), value: selectedCar.specs.time },
                  { icon: <Gauge className="w-5 h-5 text-red-500" />, label: t("details.topSpeed"), value: selectedCar.specs.speed },
                  { icon: <Fuel className="w-5 h-5 text-red-500" />, label: t("details.fuel"), value: selectedCar.specs.fuel },
                  { icon: <Users className="w-5 h-5 text-red-500" />, label: t("details.doors"), value: selectedCar.specs.doors },
                ].filter((spec) => spec.value != null).map((spec) => (
                  <div key={spec.label} className="bg-gray-100 dark:bg-black/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      {spec.icon}
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{spec.label}</span>
                    </div>
                    <div className="font-bold text-lg">{spec.value}</div>
                  </div>
                ))}

                {selectedCar.specs.transmission && (
                  <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 col-span-2 transition-colors duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="w-5 h-5 text-red-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t("details.transmission")}</span>
                    </div>
                    <div className="font-bold">{selectedCar.specs.transmission}</div>
                  </div>
                )}

                {selectedCar.specs.seats && (
                  <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-red-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t("details.seats")}</span>
                    </div>
                    <div className="font-bold text-lg">{selectedCar.specs.seats}</div>
                  </div>
                )}

                {selectedCar.specs.consumption && (
                  <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <Fuel className="w-5 h-5 text-red-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{t("details.consumption")}</span>
                    </div>
                    <div className="font-bold text-sm">{selectedCar.specs.consumption}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Équipements */}
            {selectedCar.features && selectedCar.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  {t("details.equipment")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedCar.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 text-sm bg-gray-100 dark:bg-black/30 rounded-lg p-2 transition-colors duration-300"
                    >
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="mt-auto pt-6 space-y-3">
              {selectedCar.available && (
                <button
                  onClick={onReserve}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-red-500/50 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>🚗</span>
                  <span>{t("details.reserveThis")}</span>
                </button>
              )}

              {selectedCar.isForSale && !purchaseState.done && (
                <button
                  onClick={handlePurchaseRequest}
                  disabled={purchaseState.sending}
                  className="w-full py-4 border-2 border-red-500/60 text-red-500 rounded-xl font-bold text-lg hover:bg-red-500/10 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{purchaseState.sending ? t("details.buySending") : t("details.buyRequest")}</span>
                </button>
              )}

              {purchaseState.done && (
                <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400 text-center">
                  {t("details.buySent")}
                </p>
              )}
              {purchaseState.error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 text-center">
                  {purchaseState.error}
                </p>
              )}

              <p className="text-center text-gray-500 dark:text-gray-400 text-xs">
                {t("details.footNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}