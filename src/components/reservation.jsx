import React, { useEffect, useState } from "react";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/userContext";
import { apiFetch } from "../lib/api";

function Reservation({
  showReservationModal,
  setShowReservationModal,
  selectedCar,
}) {
  const { user, token } = useAuth();

  const [reservationForm, setReservationForm] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    telephone: user?.telephone || "",
    dateDebut: "",
    dateFin: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Bloque le défilement de la page derrière la fenêtre (évite la double barre de défilement)
  useEffect(() => {
    if (!showReservationModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showReservationModal]);

  const inputClass = "w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-300";
  const labelClass = "text-sm text-gray-500 dark:text-gray-400 mb-2 block";

  const calculateTotalPrice = () => {
    if (!reservationForm.dateDebut || !reservationForm.dateFin) return 0;
    const start = new Date(reservationForm.dateDebut);
    const end = new Date(reservationForm.dateFin);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;
    return days * selectedCar.pricePerDay;
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await apiFetch("/bookings", {
        method: "POST",
        token,
        body: {
          carId: selectedCar.id,
          startDate: reservationForm.dateDebut,
          endDate: reservationForm.dateFin,
        },
      });
      setConfirmedBooking(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowReservationModal(false);
    setConfirmedBooking(null);
    setError("");
    setReservationForm((current) => ({ ...current, dateDebut: "", dateFin: "", message: "" }));
  };

  if (!showReservationModal || !selectedCar) return null;

  // Écran de confirmation après une réservation réussie
  if (confirmedBooking) {
    return (
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-6">
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 relative my-8 p-8 text-center transition-colors duration-300">
          <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Réservation enregistrée !</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Votre demande pour <span className="font-semibold text-gray-900 dark:text-white">{selectedCar.name}</span> est en attente de confirmation par notre équipe.
          </p>
          <div className="bg-gray-100 dark:bg-black/50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm transition-colors duration-300">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Du</span>
              <span className="font-semibold">{new Date(confirmedBooking.startDate).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Au</span>
              <span className="font-semibold">{new Date(confirmedBooking.endDate).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Durée</span>
              <span className="font-semibold">{confirmedBooking.days} jour{confirmedBooking.days > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="font-bold">Total</span>
              <span className="font-bold text-red-500">{confirmedBooking.totalAmount.toLocaleString()} FDJ</span>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-6">
      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 relative my-8 transition-colors duration-300">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white z-10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Réserver votre véhicule</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Remplissez le formulaire pour confirmer votre réservation
            </p>
          </div>

          {/* Car info */}
          <div className="bg-gray-100 dark:bg-black/50 rounded-xl p-4 mb-6 flex items-center space-x-4 transition-colors duration-300">
            <img
              src={selectedCar.image}
              alt={selectedCar.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{selectedCar.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedCar.brand} • {selectedCar.year}
              </p>
              <p className="text-orange-500 font-semibold mt-1">
                FDJ {selectedCar.pricePerDay}/jour
              </p>
            </div>
          </div>

          <form onSubmit={handleReservationSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom</label>
                <input
                  type="text"
                  value={reservationForm.nom}
                  onChange={(e) => setReservationForm({ ...reservationForm, nom: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Prénom</label>
                <input
                  type="text"
                  value={reservationForm.prenom}
                  onChange={(e) => setReservationForm({ ...reservationForm, prenom: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Numéro de téléphone</label>
              <input
                type="tel"
                value={reservationForm.telephone}
                onChange={(e) => setReservationForm({ ...reservationForm, telephone: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date de début</label>
                <input
                  type="date"
                  value={reservationForm.dateDebut}
                  onChange={(e) => setReservationForm({ ...reservationForm, dateDebut: e.target.value })}
                  className={inputClass}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Date de fin</label>
                <input
                  type="date"
                  value={reservationForm.dateFin}
                  onChange={(e) => setReservationForm({ ...reservationForm, dateFin: e.target.value })}
                  className={inputClass}
                  min={reservationForm.dateDebut || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Message (optionnel)</label>
              <textarea
                value={reservationForm.message}
                onChange={(e) => setReservationForm({ ...reservationForm, message: e.target.value })}
                className={`${inputClass} h-24 resize-none`}
                placeholder="Informations supplémentaires..."
              />
            </div>

            {/* Prix récap */}
            {reservationForm.dateDebut && reservationForm.dateFin && (
              <div className="bg-red-50 dark:bg-gradient-to-r dark:from-red-600/20 dark:to-orange-600/20 border border-red-200 dark:border-red-600/30 rounded-xl p-4 transition-colors duration-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Durée de location</span>
                  <span className="font-semibold">
                    {Math.ceil((new Date(reservationForm.dateFin) - new Date(reservationForm.dateDebut)) / (1000 * 60 * 60 * 24))} jours
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Prix par jour</span>
                  <span className="font-semibold">{selectedCar.pricePerDay} FDJ</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Prix Total</span>
                    <span className="text-2xl font-bold text-red-500">
                      {calculateTotalPrice().toLocaleString()} FDJ
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-red-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!reservationForm.dateDebut || !reservationForm.dateFin || submitting}
            >
              {submitting ? "Envoi en cours..." : "Confirmer la réservation"}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Reservation;