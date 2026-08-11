import React, { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Footer from "../components/footer";
import { useLang } from "../lib/i18n";
import useScrollReveal from "../lib/useScrollReveal";

export default function Contact() {
  const { t } = useLang();
  const scrollRef = useScrollReveal();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const inputClass =
    "w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-300";

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t("contact.title1")} <span className="text-red-500">{t("contact.title2")}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {sent ? (
              <p className="text-center text-green-600 dark:text-green-400 font-semibold py-8">
                {t("contact.sent")}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder={t("contact.name")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  required
                />
                <input
                  type="email"
                  placeholder={t("contact.email")}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  required
                />
                <textarea
                  placeholder={t("contact.message")}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClass} h-32 resize-none`}
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  {t("contact.send")}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
              <Phone className="w-6 h-6 text-red-500" />
              <span>+253 25 31 36 64</span>
            </div>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
              <Mail className="w-6 h-6 text-red-500" />
              <span>contact@djibdrive.dj</span>
            </div>
            <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
              <MapPin className="w-6 h-6 text-red-500" />
              <span>Djibouti City, Djibouti</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
