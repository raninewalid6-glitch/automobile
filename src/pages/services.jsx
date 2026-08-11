import React from "react";
import { Wrench, ShieldCheck, RefreshCcw, Banknote } from "lucide-react";
import Footer from "../components/footer";
import { useLang } from "../lib/i18n";
import useScrollReveal from "../lib/useScrollReveal";

export default function Services() {
  const { t } = useLang();
  const scrollRef = useScrollReveal();

  const services = [
    { icon: Banknote, title: t("footer.financing"), description: t("svcpage.financingDesc") },
    { icon: ShieldCheck, title: t("footer.insurance"), description: t("svcpage.insuranceDesc") },
    { icon: RefreshCcw, title: t("footer.tradein"), description: t("svcpage.tradeinDesc") },
    { icon: Wrench, title: t("footer.maintenance"), description: t("svcpage.maintenanceDesc") },
  ];

  return (
    <div ref={scrollRef} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t("svcpage.title1")} <span className="text-red-500">{t("svcpage.title2")}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            {t("svcpage.subtitle")}
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 hover:border-red-500/50 transition-colors duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600/10 dark:bg-red-600/20 rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
