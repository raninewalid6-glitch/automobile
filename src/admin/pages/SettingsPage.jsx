import React, { useMemo, useState } from "react";
import { BadgeDollarSign, Building2, CheckCircle2, CreditCard, Percent, Save, Settings, WalletCards } from "lucide-react";
import { useLang } from "../../lib/i18n";

const currencyFormatter = {
  format: (value) => `${new Intl.NumberFormat("fr-FR").format(value ?? 0)} FDJ`,
};

const initialSettings = {
  branding: {
    platformName: "DriveUp",
    supportEmail: "support@driveup.com",
    publicTagline: "Location et vente automobile premium",
  },
  payment: {
    defaultCurrency: "FDJ",
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
  const { t } = useLang();
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [exampleTotal, setExampleTotal] = useState(1200);
  const [exampleType, setExampleType] = useState("rentalRate");
  const [saveMessage, setSaveMessage] = useState(t("admin.settings.noChanges"));

  const paymentMethods = [
    { key: "waafiEnabled", label: t("admin.pm.waafi"), helper: t("admin.pm.waafiHelper") },
    { key: "dmoneyEnabled", label: t("admin.pm.dmoney"), helper: t("admin.pm.dmoneyHelper") },
    { key: "cardEnabled", label: t("admin.pm.card"), helper: t("admin.pm.cardHelper") },
    { key: "cashValidation", label: t("admin.pm.cash"), helper: t("admin.pm.cashHelper") },
  ];

  const transactionTypes = [
    { value: "globalRate", label: t("admin.settings.global") },
    { value: "rentalRate", label: t("admin.settings.rental") },
    { value: "saleRate", label: t("admin.settings.sale") },
  ];

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
    { label: t("admin.settings.global"), value: savedSettings.commission.globalRate },
    { label: t("admin.settings.rental"), value: savedSettings.commission.rentalRate },
    { label: t("admin.settings.sale"), value: savedSettings.commission.saleRate },
  ], [savedSettings.commission, t]);

  const updateBranding = (key, value) => {
    setSettings((current) => ({
      ...current,
      branding: { ...current.branding, [key]: value },
    }));
    setSaveMessage(t("admin.settings.pendingChanges"));
  };

  const updatePayment = (key, value) => {
    setSettings((current) => ({
      ...current,
      payment: { ...current.payment, [key]: value },
    }));
    setSaveMessage(t("admin.settings.pendingChanges"));
  };

  const updateCommission = (key, value) => {
    setSettings((current) => ({
      ...current,
      commission: { ...current.commission, [key]: value },
    }));
    setSaveMessage(t("admin.settings.pendingChanges"));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedSettings(settings);
    setSaveMessage(`${t("admin.settings.savedAt")} ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`);
  };

  return (
    <form className="space-y-7" onSubmit={handleSave}>
      <section className="overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 shadow-2xl shadow-black/30 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-200">
              {t("admin.settings.badge")}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white lg:text-5xl">{t("admin.settings.title")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 dark:text-gray-400">
              {t("admin.settings.subtitle")}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-orange-500/20 bg-gradient-to-br from-red-600/20 to-orange-500/10 p-6">
            <div className="flex items-center gap-3 text-orange-700 dark:text-orange-100">
              <Settings className="h-6 w-6" />
              <p className="text-sm font-semibold uppercase tracking-[0.25em]">{t("admin.settings.lastSave")}</p>
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
          <SettingsCard icon={Settings} eyebrow="Branding" title={t("admin.settings.brandingTitle")}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={t("admin.settings.platformName")} helper={t("admin.settings.platformNameHelper")}>
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/60"
                  onChange={(event) => updateBranding("platformName", event.target.value)}
                  value={settings.branding.platformName}
                />
              </Field>
              <Field label={t("admin.settings.email")}>
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/60"
                  onChange={(event) => updateBranding("supportEmail", event.target.value)}
                  type="email"
                  value={settings.branding.supportEmail}
                />
              </Field>
              <Field label={t("admin.settings.tagline")}>
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-red-500/60"
                  onChange={(event) => updateBranding("publicTagline", event.target.value)}
                  value={settings.branding.publicTagline}
                />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard icon={CreditCard} eyebrow="Payment" title={t("admin.settings.paymentTitle")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("admin.settings.currency")} helper={t("admin.settings.currencyHelper")}>
                <select
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  onChange={(event) => updatePayment("defaultCurrency", event.target.value)}
                  value={settings.payment.defaultCurrency}
                >
                  <option value="FDJ">FDJ (franc Djibouti)</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{t("admin.settings.methodsTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {t("admin.settings.methodsSub")}
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
          <SettingsCard icon={Percent} eyebrow="Commission" title={t("admin.settings.commTitle")}>
            <div className="space-y-5">
              <Field label={t("admin.settings.globalComm")} helper={t("admin.settings.globalCommHelper")}>
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  min="0"
                  onChange={(event) => updateCommission("globalRate", event.target.value)}
                  step="0.1"
                  type="number"
                  value={settings.commission.globalRate}
                />
              </Field>
              <Field label={t("admin.settings.rentalComm")}>
                <input
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                  min="0"
                  onChange={(event) => updateCommission("rentalRate", event.target.value)}
                  step="0.1"
                  type="number"
                  value={settings.commission.rentalRate}
                />
              </Field>
              <Field label={t("admin.settings.saleComm")}>
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

          <SettingsCard icon={BadgeDollarSign} eyebrow="Example" title={t("admin.settings.exampleTitle")}>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("admin.settings.totalTransaction")}>
                  <input
                    className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none transition focus:border-red-500/60"
                    min="0"
                    onChange={(event) => setExampleTotal(event.target.value)}
                    type="number"
                    value={exampleTotal}
                  />
                </Field>
                <Field label={t("admin.settings.commType")}>
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
                    <span className="flex items-center gap-2 text-sm font-bold text-orange-700 dark:text-orange-100"><CheckCircle2 className="h-4 w-4" /> {t("admin.settings.ownerAmount")}</span>
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
          <Save className="h-5 w-5" /> {t("admin.settings.save")}
        </button>
      </div>
    </form>
  );
}
