import React from "react";

const statusStyles = {
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  waiting_payment: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  cancelled: "border-gray-500/30 bg-gray-500/10 text-gray-600 dark:text-gray-300",
};

const statusLabels = {
  confirmed: "Confirmé",
  pending: "En attente",
  waiting_payment: "Paiement attendu",
  cancelled: "Annulé",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] ?? statusStyles.cancelled
      }`}
    >
      {statusLabels[status] ?? "Inconnu"}
    </span>
  );
}
