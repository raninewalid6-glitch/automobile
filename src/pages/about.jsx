import React from "react";
import { Award, Shield, Star } from "lucide-react";
import Footer from "../components/footer";
import { useLang } from "../lib/i18n";
import useScrollReveal from "../lib/useScrollReveal";

export default function About() {
  const { t } = useLang();
  const scrollRef = useScrollReveal();

  const stats = [
    { number: "98%", label: t("stats.satisfied"), icon: Award },
    { number: "15+", label: t("stats.years"), icon: Shield },
    { number: "50+", label: t("stats.brands"), icon: Star },
  ];

  return (
    <div ref={scrollRef} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t("about.title")} <span className="text-red-500">Djib Drive</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            {t("about.text")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-center transition-colors duration-300"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-red-500" />
              <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">{stat.number}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
