import React, { useMemo, useState } from "react";
import { BadgeDollarSign, Building2, CheckCircle2, CreditCard, Palette, Percent, Save, Settings, WalletCards } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const initialSettings = {
  branding: {
    platformName: "DriveUp",
    supportEmail: "support@driveup.com",
    accentColor: "#dc2626",
    publicTagline: "Location et vente automobile premium",
  },
  payment: {
    defaultCurrency: "USD",
    cashValidation: true,
    waafiEnabled: true,
    dmoneyEnabled: true,
    cardEnabled: true,
  },
  commission: {
    globalRate: 8,
    rentalRate: 12,
    saleRate: 5,
  },
};

const paymentMethods = [
  { key: "waafiEnabled", label: "WAAFI", helper: "Paiements mobiles WAAFI actifs dans le checkout." },
  { key: "dmoneyEnabled", label: "D-Money", helper: "Paiements D-Money proposés aux clients." },
  { key: "cardEnabled", label: "Carte bancaire", helper: "Mastercard / carte bancaire visible côté client." },
  { key: "cashValidation", label: "Validation cash", helper: "Les paiements cash restent à valider par un admin." },
];

const transactionTypes = [
  { value: "globalRate", label: "Globale" },
  { value: "rentalRate", label: "Location" },
  { value: "saleRate", label: "Vente" },
];

function toNumber(value) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function SettingsCard({ icon, eyebrow, title, children }) {
  const IconComponent = icon;

  return (
    <section className="rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/25 lg:p-7">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/25">
          <IconComponent className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-700 dark:text-orange-300">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-black text-gray-900 dark:text-white">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, helper }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-gray-600 dark:text-gray-200">{label}</span>
      <div className="mt-2">{children}</div>
      {helper ? <span className="mt-2 block text-xs leading-5 text-gray-500 dark:text-gray-400">{helper}</span> : null}
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [exampleTotal, setExampleTotal] = useState(1200);
  const [exampleType, setExampleType] = useState("rentalRate");
  const [saveMessage, setSaveMessage] = useState("Paramètres mock non sauvegardés");

  const example = useMemo(() => {
    const total = Math.max(toNumber(exampleTotal), 0);
    const rate = Math.max(toNumber(settings.commission[exampleType]), 0);
    const commission = total * (rate / 100);

    return {
      total,
      rate,
      commission,
      ownerAmount: Math.max(total - commission, 0),
    };
  }, [exampleTotal, exampleType, settings.commission]);

  const savedCommissionPreview = useMemo(() => [
    { label: "Globale", value: savedSettings.commission.globalRate },
    { label: "Location", value: savedSettings.commission.rentalRate },
    { label: "Vente", value: savedSettings.commission.saleRate },
  ], [savedSettings.commission]);

  const updateBranding = (key, value) => {
    setSettings((current) => ({
      ...current,
      branding: {
        ...current.branding,
        [key]: value,
      },
    }));
    setSaveMessage("Modifications locales en attente");
  };

  const updatePayment = (key, value) => {
    setSettings((current) => ({
      ...current,
      payment: {
        ...current.payment,
        [key]: value,
      },
    }));
    setSaveMessage("Modifications locales en attente");
  };

  const updateCommission = (key, value) => {
    setSettings((current) => ({
      ...current,
      commission: {
        ...current.commission,
        [key]: value,
      },
    }));
    setSaveMessage("Modifications locales en attente");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedSettings(settings);
    setSaveMessage(`Sauvegardé localement à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`);
  };

  return (
    <form className="space-y-7" onSubmit={handleSave}>
      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              Settings admin mock
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">Paramètres de la plateforme</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 dark:text-gray-400">
              Gérez le branding, les moyens de paiement et les commissions sans backend. Le bouton enregistrer met uniquement à jour l'état local de cette page.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-orange-500/20 bg-gradient-to-br from-red-600/20 to-orange-500/10 p-6">
            <div className="flex items-center gap-3 text-orange-700 dark:text-orange-100">
              <Settings className="h-6 w-6" />
              <p className="text-sm font-semibold uppercase tracking-[0.25em]">Dernière sauvegarde</p>
            </div>
            <p className="mt-4 text-2xl font-black text-gray-900 dark:text-white">{saveMessage}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {savedCommissionPreview.map((item) => (
                <span key={item.label} className="rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/30 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                  {item.label}: {item.value}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-7">
          <SettingsCard icon={Palette} eyebrow="Branding settings" title="Identité publique">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom plateforme" helper="Affiché dans l'admin et les futures pages publiques.">
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/60"
                  onChange={(event) => updateBranding("platformName", event.target.value)}
                  value={settings.branding.platformName}
                />
              </Field>
              <Field label="Email support">
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/60"
                  onChange={(event) => updateBranding("supportEmail", event.target.value)}
                  type="email"
                  value={settings.branding.supportEmail}
                />
              </Field>
              <Field label="Couleur accent" helper="Prévisualisation locale du thème principal.">
                <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3">
                  <input
                    className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
                    onChange={(event) => updateBranding("accentColor", event.target.value)}
                    type="color"
                    value={settings.branding.accentColor}
                  />
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{settings.branding.accentColor}</span>
                </div>
              </Field>
              <Field label="Tagline publique">
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/60"
                  onChange={(event) => updateBranding("publicTagline", event.target.value)}
                  value={settings.branding.publicTagline}
                />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard icon={CreditCard} eyebrow="Payment settings" title="Moyens de paiement">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Devise par défaut" helper="Mock uniquement, aucune conversion réelle n'est effectuée.">
                <select
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  onChange={(event) => updatePayment("defaultCurrency", event.target.value)}
                  value={settings.payment.defaultCurrency}
                >
                  <option value="USD">USD</option>
                  <option value="DJF">DJF</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white">État mock</p>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Les options activées sont enregistrées dans le state local et seront réinitialisées au rechargement.
                </p>
              </div>
              {paymentMethods.map((method) => (
                <label key={method.key} className="flex cursor-pointer gap-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4 transition hover:border-red-500/30">
                  <input
                    checked={settings.payment[method.key]}
                    className="mt-1 h-5 w-5 accent-red-600"
                    onChange={(event) => updatePayment(method.key, event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">{method.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{method.helper}</span>
                  </span>
                </label>
              ))}
            </div>
          </SettingsCard>
        </div>

        <div className="space-y-7">
          <SettingsCard icon={Percent} eyebrow="Commission settings" title="Taux de commission">
            <div className="space-y-5">
              <Field label="Commission globale %" helper="Taux de fallback pour les opérations non catégorisées.">
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  min="0"
                  onChange={(event) => updateCommission("globalRate", event.target.value)}
                  step="0.1"
                  type="number"
                  value={settings.commission.globalRate}
                />
              </Field>
              <Field label="Commission location %">
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  min="0"
                  onChange={(event) => updateCommission("rentalRate", event.target.value)}
                  step="0.1"
                  type="number"
                  value={settings.commission.rentalRate}
                />
              </Field>
              <Field label="Commission vente %">
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  min="0"
                  onChange={(event) => updateCommission("saleRate", event.target.value)}
                  step="0.1"
                  type="number"
                  value={settings.commission.saleRate}
                />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard icon={BadgeDollarSign} eyebrow="Exemple dynamique" title="Répartition owner">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Total transaction">
                  <input
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                    min="0"
                    onChange={(event) => setExampleTotal(event.target.value)}
                    type="number"
                    value={exampleTotal}
                  />
                </Field>
                <Field label="Type commission">
                  <select
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                    onChange={(event) => setExampleType(event.target.value)}
                    value={exampleType}
                  >
                    {transactionTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300"><WalletCards className="h-4 w-4" /> Total</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(example.total)}</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-100"><Building2 className="h-4 w-4" /> Commission ({example.rate}%)</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(example.commission)}</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-bold text-orange-700 dark:text-orange-100"><CheckCircle2 className="h-4 w-4" /> Owner amount</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(example.ownerAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </SettingsCard>
        </div>
      </div>

      <div className="sticky bottom-24 z-20 flex justify-end lg:bottom-6">
        <button className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-red-600/30 transition hover:scale-[1.01]" type="submit">
          <Save className="h-5 w-5" /> Save settings mock
        </button>
      </div>
    </form>
  );
}
