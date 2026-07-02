import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Ban, CarFront, CheckCircle2, FileText, ReceiptText, ShoppingCart, UserRound, WalletCards, XCircle } from "lucide-react";
import { adminPurchases, purchaseStatusLabels, purchaseStatusStyles } from "../mock/adminPurchases.mock";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value) {
  if (value.includes("T")) {
    return dateFormatter.format(new Date(value));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dateFormatter.format(new Date(`${value}T00:00:00`));
  }

  return value;
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
          <dd className="mt-2 break-words font-bold text-gray-900 dark:text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ActionButton({ icon, label, helper, onClick, tone = "default", disabled }) {
  const toneClasses = {
    accept: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100 hover:bg-emerald-500/20",
    reject: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-100 hover:bg-red-500/20",
    complete: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-100 hover:bg-blue-500/20",
    default: "border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10",
  };

  return (
    <button
      className={`flex items-start gap-3 rounded-3xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${toneClasses[tone]}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {React.createElement(icon, { className: "mt-1 h-5 w-5 shrink-0" })}
      <span>
        <span className="block font-black">{label}</span>
        <span className="mt-1 block text-xs leading-5 opacity-75">{helper}</span>
      </span>
    </button>
  );
}

export default function PurchaseDetailsPage() {
  const { id } = useParams();
  const purchase = adminPurchases.find((item) => item.id === id);
  const [currentStatus, setCurrentStatus] = useState(purchase?.status ?? "PENDING");

  const statusTimeline = useMemo(() => {
    if (!purchase) {
      return [];
    }

    const mockAction = currentStatus !== purchase.status
      ? [{ label: `Action mock: ${purchaseStatusLabels[currentStatus]}`, date: "Session admin", status: currentStatus, description: "Changement local non persisté côté backend." }]
      : [];

    return [...purchase.timeline, ...mockAction];
  }, [currentStatus, purchase]);

  if (!purchase) {
    return (
      <div className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-700 dark:text-red-300">Demande introuvable</p>
        <h2 className="mt-3 text-3xl font-black text-gray-900 dark:text-white">Aucun mock ne correspond à {id}</h2>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 font-bold text-white" to="/admin/purchases">
          <ArrowLeft className="h-4 w-4" /> Retour aux achats
        </Link>
      </div>
    );
  }

  const commissionAmount = Math.round((purchase.salePrice * purchase.commissionRate) / 100);
  const ownerNetAmount = purchase.salePrice - commissionAmount;
  const remainingAmount = Math.max(purchase.salePrice - purchase.depositAmount, 0);

  const saleBreakdown = [
    ["Prix de vente", "Montant négocié avec le client", purchase.salePrice],
    ["Commission plateforme", `${purchase.commissionRate}% du prix de vente`, commissionAmount],
    ["Reversement owner", "Net estimé après commission", ownerNetAmount],
    ["Acompte demandé", "Sécurisation de la demande", purchase.depositAmount],
    ["Reste à payer", `Mode: ${purchase.paymentMethod}`, remainingAmount],
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-white" to="/admin/purchases">
          <ArrowLeft className="h-4 w-4" /> Retour aux achats
        </Link>
        <StatusPill status={currentStatus} />
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 shadow-2xl shadow-black/30">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 lg:p-8">
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Détails demande d'achat
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{purchase.id}</h2>
            <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
              {purchase.client.name} souhaite acheter {purchase.car.title} auprès de {purchase.owner.name}. Statut courant mock: {purchaseStatusLabels[currentStatus]}.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale price</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(purchase.salePrice)}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Commission</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(commissionAmount)}</p>
              </div>
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">Créée le</p>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{formatDate(purchase.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-black/10 dark:border-white/10 bg-gradient-to-br from-red-600/15 to-orange-500/10 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-700 dark:text-orange-200">Actions mock</p>
            <div className="mt-5 grid gap-3">
              <ActionButton
                icon={CheckCircle2}
                label="Accepter"
                helper="Passe la demande au statut ACCEPTED dans l'interface seulement."
                tone="accept"
                onClick={() => setCurrentStatus("ACCEPTED")}
                disabled={["ACCEPTED", "COMPLETED", "CANCELLED"].includes(currentStatus)}
              />
              <ActionButton
                icon={XCircle}
                label="Rejeter"
                helper="Marque la demande comme REJECTED sans appel backend."
                tone="reject"
                onClick={() => setCurrentStatus("REJECTED")}
                disabled={["REJECTED", "COMPLETED", "CANCELLED"].includes(currentStatus)}
              />
              <ActionButton
                icon={BadgeCheck}
                label="Marquer comme vendu"
                helper="Clôture la vente en statut COMPLETED côté mock."
                tone="complete"
                onClick={() => setCurrentStatus("COMPLETED")}
                disabled={currentStatus === "COMPLETED" || currentStatus === "REJECTED" || currentStatus === "CANCELLED"}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-3">
        <DetailCard icon={UserRound} title="Client info">
          <DefinitionList items={[
            ["Nom", purchase.client.name],
            ["Téléphone", purchase.client.phone],
            ["Email", purchase.client.email],
            ["Ville", purchase.client.city],
            ["Document", purchase.client.document],
            ["Adresse", purchase.client.address],
          ]} />
        </DetailCard>

        <DetailCard icon={CarFront} title="Car info">
          <DefinitionList items={[
            ["Voiture", purchase.car.title],
            ["Plaque", purchase.car.plateNumber],
            ["Ville", purchase.car.city],
            ["Catégorie", purchase.car.category],
            ["Année", purchase.car.year],
            ["Kilométrage", purchase.car.mileage],
          ]} />
        </DetailCard>

        <DetailCard icon={ShoppingCart} title="Owner info">
          <DefinitionList items={[
            ["Owner", purchase.owner.name],
            ["Téléphone", purchase.owner.phone],
            ["Email", purchase.owner.email],
            ["Ville", purchase.owner.city],
            ["Mode paiement", purchase.paymentMethod],
            ["Statut", purchaseStatusLabels[currentStatus]],
          ]} />
        </DetailCard>
      </section>

      <section className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
        <DetailCard icon={WalletCards} title="Sale breakdown">
          <div className="space-y-3">
            {saleBreakdown.map(([label, helper, amount]) => (
              <div key={label} className="flex items-start justify-between gap-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="font-black text-gray-900 dark:text-white">{label}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
                </div>
                <p className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(amount)}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Notes</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{purchase.notes}</p>
            </div>
          </div>
        </DetailCard>

        <DetailCard icon={ReceiptText} title="Status timeline">
          <ol className="space-y-4">
            {statusTimeline.map((event, index) => {
              const isCompleted = event.status === "COMPLETED" || event.status === "ACCEPTED";
              const isCancelled = event.status === "CANCELLED" || event.status === "REJECTED";

              return (
                <li key={`${event.label}-${index}`} className="flex gap-4 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4">
                  <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isCancelled ? "bg-red-500/20 text-red-700 dark:text-red-200" : isCompleted ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-200" : "bg-orange-500/20 text-orange-700 dark:text-orange-200"}`}>
                    {isCancelled ? <Ban className="h-4 w-4" /> : isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-black text-gray-900 dark:text-white">{event.label}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{formatDate(event.date)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{event.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </DetailCard>
      </section>
    </div>
  );
}
