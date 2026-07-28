import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CarFront, CheckCircle2, FileText, Flag, ShoppingCart, UserRound, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminAuth } from "../context/AdminAuthContext";
import { purchaseStatusLabels, purchaseStatusStyles } from "../lib/purchaseOptions";

// Montants affichés en francs Djibouti
const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

function formatDateTime(value) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${purchaseStatusStyles[status] ?? purchaseStatusStyles.PENDING}`}>
      {purchaseStatusLabels[status] ?? status}
    </span>
  );
}

function DetailCard({ icon, title, children }) {
  return (
    <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500">
          {React.createElement(icon, { className: "h-5 w-5 text-white" })}
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DefinitionList({ items }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{label}</dt>
          <dd className="mt-2 break-words font-bold text-gray-900 dark:text-white">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PurchaseDetailsPage() {
  const { id } = useParams();
  const { token } = useAdminAuth();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/admin/purchases/${id}`, { token })
      .then((data) => setPurchase(data.purchase))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const updateStatus = async (status) => {
    if (status === "COMPLETED" && !window.confirm("Finaliser la vente ? La voiture sera retirée du catalogue.")) {
      return;
    }
    try {
      const data = await apiFetch(`/admin/purchases/${id}/status`, { method: "PUT", token, body: { status } });
      setPurchase(data.purchase);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Chargement de la demande d'achat...</p>
    );
  }

  if (!purchase) {
    return (
      <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-700 dark:text-red-300">Demande introuvable</p>
        <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{error || `Aucune demande ne correspond à ${id}`}</h2>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 font-bold text-white" to="/admin/purchases">
          <ArrowLeft className="h-4 w-4" /> Retour aux demandes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-white" to="/admin/purchases">
          <ArrowLeft className="h-4 w-4" /> Retour aux demandes d'achat
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={purchase.status} />
          {purchase.status === "PENDING" && (
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              onClick={() => updateStatus("ACCEPTED")}
            >
              <CheckCircle2 className="h-4 w-4" /> Accepter
            </button>
          )}
          {purchase.status === "ACCEPTED" && (
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20"
              onClick={() => updateStatus("COMPLETED")}
            >
              <Flag className="h-4 w-4" /> Finaliser la vente
            </button>
          )}
          {(purchase.status === "PENDING" || purchase.status === "ACCEPTED") && (
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-300 hover:bg-red-500/20"
              onClick={() => updateStatus("REJECTED")}
            >
              <XCircle className="h-4 w-4" /> Rejeter
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 shadow-2xl shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 lg:p-8">
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Détails demande d'achat
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              Demande {purchase.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {purchase.car.title} — demande envoyée par {purchase.client.name} le {formatDateTime(purchase.createdAt)}.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
                <p className="text-sm text-orange-700 dark:text-orange-200">Prix de vente</p>
                <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(purchase.price)}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Décision</p>
                <p className="mt-2 text-xl font-black text-gray-900 dark:text-white">
                  {purchase.decidedAt ? formatDateTime(purchase.decidedAt) : "En attente"}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-black/10 dark:border-white/10 bg-gradient-to-br from-red-600/15 to-orange-500/10 p-6 lg:border-l lg:border-t-0 lg:p-8">
            {purchase.car.image ? (
              <img src={purchase.car.image} alt={purchase.car.title} className="h-56 w-full rounded-3xl object-cover" />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-3xl bg-black/20 text-sm font-bold text-gray-400">
                Aucune photo
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
              <span className="text-gray-500 dark:text-gray-400">Statut</span>
              <StatusPill status={purchase.status} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-3">
        <DetailCard icon={UserRound} title="Acheteur">
          <DefinitionList items={[
            ["Nom", purchase.client.name],
            ["Téléphone", purchase.client.phone],
            ["Email", purchase.client.email],
            ["Ville", purchase.client.city],
          ]} />
        </DetailCard>

        <DetailCard icon={CarFront} title="Voiture">
          <DefinitionList items={[
            ["Véhicule", purchase.car.title],
            ["Plaque", purchase.car.plateNumber],
            ["Année", purchase.car.year],
            ["Ville", purchase.car.city],
          ]} />
        </DetailCard>

        <DetailCard icon={ShoppingCart} title="Propriétaire">
          <DefinitionList items={[
            ["Nom", purchase.owner.name],
            ["Téléphone", purchase.owner.phone],
            ["Email", purchase.owner.email],
          ]} />
        </DetailCard>
      </section>

      {purchase.note && (
        <DetailCard icon={FileText} title="Message du client">
          <p className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {purchase.note}
          </p>
        </DetailCard>
      )}
    </div>
  );
}
