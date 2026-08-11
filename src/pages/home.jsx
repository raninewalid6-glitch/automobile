import { useEffect, useState } from "react";
import React from "react";
import { Link } from "react-router-dom";

import {
  Search,
  Car,
  Shield,
  Clock,
  Star,
  ChevronRight,
  MapPin,
  Calendar,
  Menu,
  Phone,
  Mail,
  Zap,
  Award,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CarDetailsModal from "../components/detailsmodal";
import Connexion from "../components/login";
import HeroCarousel from "../components/herocarousel";
import Footer from "../components/footer";
import { fetchPublicCars } from "../lib/publicCars";
import { useLang } from "../lib/i18n";
import useScrollReveal from "../lib/useScrollReveal";

// Slides affichées si l'API est éteinte ou si aucune voiture n'a de photo
const defaultHeroSlides = [
  {
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200",
    title: "Des véhicules d'exception",
    subtitle: "Location & vente à Djibouti",
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    title: "Performances premium",
    subtitle: "Réservez en quelques clics",
  },
  {
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200",
    title: "Un service 5 étoiles",
    subtitle: "Garantie et accompagnement inclus",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("new");
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [featuredCars, setFeaturedCars] = useState([]);
  const scrollRef = useScrollReveal();

  // Charge les vraies voitures : elles alimentent le carrousel ET la Collection Premium
  useEffect(() => {
    fetchPublicCars()
      .then((cars) => {
        setFeaturedCars(cars.slice(0, 4));

        const slides = cars
          .filter((car) => car.image)
          .slice(0, 5)
          .map((car) => ({
            image: car.image,
            title: car.name,
            subtitle: car.pricePerDay != null
              ? `${car.pricePerDay.toLocaleString("fr-FR")} FDJ/jour`
              : car.price != null
                ? `${car.price.toLocaleString("fr-FR")} FDJ`
                : "",
          }));
        if (slides.length > 0) setHeroSlides(slides);
      })
      .catch(() => {
        // API éteinte : on garde les slides par défaut
      });
  }, []);

  const stats = [
    { number: "98%", label: t("stats.satisfied"), icon: <Award className="w-6 h-6" /> },
    { number: "15+", label: t("stats.years"), icon: <Shield className="w-6 h-6" /> },
    { number: "50+", label: t("stats.brands"), icon: <Star className="w-6 h-6" /> },
  ];

  return (
    <div ref={scrollRef} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">

      {/* Hero Section : carrousel plein écran avec le texte par-dessus */}
      <HeroCarousel slides={heroSlides}>
        <div className="max-w-7xl mx-auto flex h-full items-end sm:items-center px-4 sm:px-6 pt-16 sm:pt-20 pb-32 sm:pb-8">
          <div className="max-w-2xl">
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600/30 border border-red-500/40 rounded-full mb-3 sm:mb-6 backdrop-blur-sm">
              <span className="text-red-300 text-xs sm:text-sm font-medium">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-3 sm:mb-6 leading-tight text-white hero-title-glow">
              {t("hero.title1")}
              <span className="block bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent drop-shadow-none">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="text-sm sm:text-xl text-gray-200 mb-5 sm:mb-8 leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
              {t("hero.text")}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/cars"
                className="btn-glow px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-semibold text-sm sm:text-base"
              >
                {t("hero.viewCollection")}
              </Link>
              <Link
                to="/contact"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                {t("hero.appointment")}
              </Link>
            </div>
          </div>
        </div>
      </HeroCarousel>

      {/* Search Bar */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">{t("search.type")}</label>
                <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm transition-colors duration-300">
                  <option>{t("search.allTypes")}</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Sports</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">{t("search.brand")}</label>
                <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm transition-colors duration-300">
                  <option>{t("search.allBrands")}</option>
                  <option>Toyota</option>
                  <option>Hyundai</option>
                  <option>Kia</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">{t("search.maxPrice")}</label>
                <input
                  type="text"
                  placeholder="100 000 FDJ"
                  className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm transition-colors duration-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">{t("search.year")}</label>
                <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm transition-colors duration-300">
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-1 flex items-end">
                <button className="w-full bg-gradient-to-r from-red-600 to-orange-500 rounded-lg px-4 sm:px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-red-500/50 transition flex items-center justify-center text-sm sm:text-base">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("search.button")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:border-red-500/50 transition-colors duration-300"
              >
                <div className="text-red-500 mb-2 sm:mb-4">{stat.icon}</div>
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">{t("collection.title")}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                {t("collection.subtitle")}
              </p>
            </div>

            <div className="flex gap-2 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("new")}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition text-sm sm:text-base ${
                  activeTab === "new"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t("collection.new")}
              </button>
              <button
                onClick={() => setActiveTab("used")}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition text-sm sm:text-base ${
                  activeTab === "used"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t("collection.used")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCars.map((car) => (
              <div key={car.id} className="group relative flex">
                <div className="car-card flex flex-col w-full bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="relative h-44 sm:h-48 overflow-hidden shrink-0">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <button className="w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-600 transition text-white">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="text-xs text-red-500 font-semibold mb-1 sm:mb-2">
                      {car.category}
                    </div>
                    <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">{car.name}</h3>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6 text-xs">
                      <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-1.5 sm:p-2 text-center transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400">{t("card.seats")}</div>
                        <div className="font-semibold">{car.specs.seats}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-1.5 sm:p-2 text-center transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400">{t("card.doors")}</div>
                        <div className="font-semibold">{car.specs.doors}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-1.5 sm:p-2 text-center transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400">{t("card.fuel")}</div>
                        <div className="font-semibold">{car.specs.fuel}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                      <div className="text-lg sm:text-xl font-bold leading-tight">
                        {car.price != null
                          ? `${car.price.toLocaleString()} FDJ`
                          : car.pricePerDay != null
                            ? `${car.pricePerDay.toLocaleString()} FDJ/jour`
                            : "—"}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCar(car);
                          setShowModal(true);
                        }}
                        className="btn-glow shrink-0 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full text-xs sm:text-sm font-semibold"
                      >
                        {t("card.details")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/cars"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-black/10 dark:bg-white/10 backdrop-blur-sm border border-black/20 dark:border-white/20 rounded-full font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition inline-flex items-center text-sm sm:text-base"
            >
              {t("collection.viewAll")}
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50/50 dark:bg-gradient-to-b dark:from-transparent dark:to-gray-900/50 transition-colors duration-300 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">{t("services.title")}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              {t("services.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />,
                title: t("services.s1title"),
                desc: t("services.s1desc"),
              },
              {
                icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />,
                title: t("services.s2title"),
                desc: t("services.s2desc"),
              },
              {
                icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />,
                title: t("services.s3title"),
                desc: t("services.s3desc"),
                extra: "sm:col-span-2 md:col-span-1",
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className={`car-card bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 ${service.extra || ""}`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-600/10 dark:bg-red-600/20 rounded-xl flex items-center justify-center mb-5 sm:mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDI0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-white">
                {t("cta.title")}
              </h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
                {t("cta.text")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 rounded-full font-bold hover:bg-gray-100 transition text-sm sm:text-base">
                  {t("cta.appointment")}
                </button>
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-full font-bold hover:bg-white/30 transition text-sm sm:text-base">
                  {t("cta.contact")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
        

      {/* Modal Car Details */}
      <CarDetailsModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedCar={selectedCar}
        onReserve={() => {
          setShowModal(false);
          navigate("/cars");
        }}
      />

      {/* Modal Connexion */}
      <Connexion
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        setShowReservationModal={setShowReservationModal}
      />
    </div>
  );
}