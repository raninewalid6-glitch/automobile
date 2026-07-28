// Libellés et styles français pour les paiements

export const paymentMethodLabels = {
  WAAFI: "Waafi",
  DMONEY: "D-Money",
  MASTERCARD: "MasterCard",
  CASH: "Espèces",
};

export const paymentStatusLabels = {
  PENDING: "En attente",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

export const paymentStatusStyles = {
  PENDING: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  PAID: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  REFUNDED: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};
