// Libellés et styles français pour les statuts de réservation

export const bookingStatusLabels = {
  PENDING: "En attente",
  PENDING_PAYMENT: "Attente paiement",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export const bookingStatusStyles = {
  PENDING: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  PENDING_PAYMENT: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  CONFIRMED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  COMPLETED: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};
