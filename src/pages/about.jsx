import React from "react";
import { Award, Shield, Star } from "lucide-react";
import Footer from "../components/footer";

const stats = [
  { number: "98%", label: "Clients Satisfaits", icon: Award },
  { number: "15+", label: "Ans d'Expérience", icon: Shield },
  { number: "50+", label: "Marques Premium", icon: Star },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            À propos de <span className="text-red-500">Djib Drive</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            Djib Drive est la référence à Djibouti pour la location et la vente de véhicules premium.
            Depuis notre création, nous accompagnons nos clients avec une flotte soigneusement
            sélectionnée, un service transparent et une équipe passionnée par l'automobile.
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
