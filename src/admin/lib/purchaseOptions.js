// Libellés et styles français pour les statuts de demandes d'achat

export const purchaseStatusLabels = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Rejetée",
  COMPLETED: "Vendue",
  CANCELLED: "Annulée",
};

export const purchaseStatusStyles = {
  PENDING: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  COMPLETED: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  CANCELLED: "border-gray-500/30 bg-gray-500/10 text-gray-600 dark:text-gray-300",
};
