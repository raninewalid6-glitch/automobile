import React, { useState } from "react";
import { X, CreditCard, Smartphone, Lock, CheckCircle } from "lucide-react";

function Paiement({
  showPaymentModal,
  setShowPaymentModal,
  reservationData,
  selectedCar,
  totalPrice,
}) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "", cardName: "", expiryDate: "", cvv: "",
    phoneNumber: "", pin: "",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const inputClass = "w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-300";
  const labelClass = "text-sm text-gray-500 dark:text-gray-400 mb-2 block";

  const walletOptions = [
    { id: "waafi", name: "Waafi", color: "from-green-600 to-green-500" },
    { id: "dmoney", name: "D-Money", color: "from-orange-600 to-orange-500" },
  ];

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(" ") : value;
  };

  const isFormValid = () => {
    if (paymentMethod === "card") {
      return paymentForm.cardNumber.length >= 15 && paymentForm.cardName.length > 0 &&
        paymentForm.expiryDate.length === 5 && paymentForm.cvv.length === 3;
    } else if (paymentMethod) {
      return paymentForm.phoneNumber.length > 0 && paymentForm.pin.length === 4;
    }
    return false;
  };

  const handlePaymentSubmit = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentSuccess(false);
      setPaymentMethod("");
      setPaymentForm({ cardNumber: "", cardName: "", expiryDate: "", cvv: "", phoneNumber: "", pin: "" });
    }, 3000);
  };

  if (!showPaymentModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 relative my-8 transition-colors duration-300">
        <button
          onClick={() => setShowPaymentModal(false)}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white z-10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {!paymentSuccess ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Paiement sécurisé</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Choisissez votre méthode de paiement
                </p>
              </div>

              {/* Montant */}
              <div className="bg-red-50 dark:bg-gradient-to-r dark:from-red-600/20 dark:to-orange-600/20 border border-red-200 dark:border-red-600/30 rounded-xl p-4 mb-6 transition-colors duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Montant à payer</span>
                  <span className="text-3xl font-bold text-red-500">
                    {totalPrice?.toLocaleString() || 0} FDJ
                  </span>
                </div>
              </div>

              {/* Choix méthode */}
              {!paymentMethod && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-red-500 transition flex items-center space-x-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Carte bancaire</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Visa, Mastercard, Amex</p>
                    </div>
                  </button>

                  {walletOptions.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setPaymentMethod(wallet.id)}
                      className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-red-500 transition flex items-center space-x-4"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${wallet.color} rounded-lg flex items-center justify-center`}>
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{wallet.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Paiement mobile sécurisé</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Formulaire paiement */}
              {paymentMethod && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("")}
                    className="text-red-500 hover:text-red-400 text-sm mb-4"
                  >
                    ← Changer de méthode
                  </button>

                  {paymentMethod === "card" && (
                    <>
                      <div>
                        <label className={labelClass}>Numéro de carte</label>
                        <input
                          type="text"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(e.target.value) })}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Nom sur la carte</label>
                        <input
                          type="text"
                          value={paymentForm.cardName}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value.toUpperCase() })}
                          placeholder="JEAN DUPONT"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Date d'expiration</label>
                          <input
                            type="text"
                            value={paymentForm.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                              setPaymentForm({ ...paymentForm, expiryDate: value });
                            }}
                            placeholder="MM/AA"
                            maxLength={5}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>CVV</label>
                          <input
                            type="text"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, "") })}
                            placeholder="123"
                            maxLength={3}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod !== "card" && paymentMethod && (
                    <>
                      <div>
                        <label className={labelClass}>Numéro de téléphone</label>
                        <input
                          type="tel"
                          value={paymentForm.phoneNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, phoneNumber: e.target.value })}
                          placeholder="+253 77 XX XX XX"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Code PIN (4 chiffres)</label>
                        <input
                          type="password"
                          value={paymentForm.pin}
                          onChange={(e) => setPaymentForm({ ...paymentForm, pin: e.target.value.replace(/\D/g, "") })}
                          placeholder="••••"
                          maxLength={4}
                          className={`${inputClass} text-center text-2xl tracking-widest`}
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-600/30 rounded-lg p-3 transition-colors duration-300">
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          Un code de confirmation sera envoyé à votre numéro
                        </p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handlePaymentSubmit}
                    disabled={!isFormValid()}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-red-500/50 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Payer {totalPrice?.toLocaleString() || 0} FDJ
                  </button>

                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                    Vos informations de paiement sont sécurisées et cryptées
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Paiement réussi !</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Votre réservation a été confirmée
              </p>
              <div className="bg-gray-100 dark:bg-black/50 rounded-xl p-4 max-w-md mx-auto transition-colors duration-300">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Un email de confirmation vous sera envoyé sous peu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Paiement;