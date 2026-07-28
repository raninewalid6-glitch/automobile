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
import { fetchPublicCars } from "../lib/publicCars";

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
  const [activeTab, setActiveTab] = useState("new");
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);

  // Remplit le carrousel avec les vraies voitures du catalogue (max 5)
  useEffect(() => {
    fetchPublicCars()
      .then((cars) => {
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

  const featuredCars = [
    {
      id: 1,
      name: "Porsche 911 Turbo S",
      category: "Sports Car",
      brand: "Porsche",
      year: "2024",
      price: 185000,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      specs: { power: "640 HP", speed: "330 km/h", time: "2.7s" },
    },
    {
      id: 2,
      name: "Mercedes-AMG GT",
      category: "Luxury",
      brand: "Mercedes",
      year: "2024",
      price: 142000,
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
      specs: { power: "523 HP", speed: "310 km/h", time: "3.6s" },
    },
    {
      id: 3,
      name: "BMW M8 Competition",
      category: "Performance",
      brand: "BMW",
      year: "2024",
      price: 138000,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      specs: { power: "625 HP", speed: "305 km/h", time: "3.2s" },
    },
    {
      id: 4,
      name: "Audi RS e-tron GT",
      category: "Electric",
      brand: "Audi",
      year: "2024",
      price: 148000,
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      specs: { power: "646 HP", speed: "250 km/h", time: "3.3s" },
    },
  ];

  const stats = [
    { number: "98%", label: "Clients Satisfaits", icon: <Award className="w-6 h-6" /> },
    { number: "15+", label: "Ans d'Expérience", icon: <Shield className="w-6 h-6" /> },
    { number: "50+", label: "Marques Premium", icon: <Star className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">

      {/* Hero Section : carrousel plein écran avec le texte par-dessus */}
      <HeroCarousel slides={heroSlides}>
        <div className="max-w-7xl mx-auto flex h-full items-center px-4 sm:px-6 pt-16 sm:pt-20">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-2 bg-red-600/30 border border-red-500/40 rounded-full mb-6 backdrop-blur-sm">
              <span className="text-red-300 text-sm font-medium">
                🔥 Nouveau Collection 2026
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Conduisez
              <span className="block bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                Votre Rêve
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-200 mb-8 leading-relaxed drop-shadow">
              Découvrez notre collection exclusive de véhicules. Des
              performances exceptionnelles, un luxe incomparable.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/cars"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-red-500/50 transition text-sm sm:text-base"
              >
                Voir la Collection
              </Link>
              <Link
                to="/contact"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full font-semibold hover:bg-white/20 transition text-sm sm:text-base"
              >
                Prendre RDV
              </Link>
            </div>
          </div>
        </div>
      </HeroCarousel>

      {/* Search Bar */}
      <section className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Type</label>
                <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm transition-colors duration-300">
                  <option>All Types</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Sports</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Marque</label>
                <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm transition-colors duration-300">
                  <option>All Brands</option>
                  <option>BMW</option>
                  <option>Mercedes</option>
                  <option>Audi</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Prix Max</label>
                <input
                  type="text"
                  placeholder="100 000 FDJ"
                  className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm transition-colors duration-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Année</label>
                <select className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 text-sm transition-colors duration-300">
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-1 flex items-end">
                <button className="w-full bg-gradient-to-r from-red-600 to-orange-500 rounded-lg px-4 sm:px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-red-500/50 transition flex items-center justify-center text-sm sm:text-base">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
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
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">Collection</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                Découvrez nos véhicules d'exception
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
                Nouveaux
              </button>
              <button
                onClick={() => setActiveTab("used")}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition text-sm sm:text-base ${
                  activeTab === "used"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Occasion
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCars.map((car) => (
              <div key={car.id} className="group relative">
                <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-500/50 transition-colors duration-300">
                  <div className="relative h-44 sm:h-48 overflow-hidden">
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

                  <div className="p-4 sm:p-6">
                    <div className="text-xs text-red-500 font-semibold mb-1 sm:mb-2">
                      {car.category}
                    </div>
                    <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">{car.name}</h3>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6 text-xs">
                      <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-1.5 sm:p-2 text-center transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400">Power</div>
                        <div className="font-semibold">{car.specs.power}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-1.5 sm:p-2 text-center transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400">Speed</div>
                        <div className="font-semibold">{car.specs.speed}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-black/50 rounded-lg p-1.5 sm:p-2 text-center transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400">0-100</div>
                        <div className="font-semibold">{car.specs.time}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-lg sm:text-2xl font-bold">
                        {car.price.toLocaleString()} FDJ
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCar(car);
                          setShowModal(true);
                        }}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
                      >
                        Details
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
              Voir Tous les Véhicules
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50/50 dark:bg-gradient-to-b dark:from-transparent dark:to-gray-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              Une expérience client d'exception
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />,
                title: "Garantie Totale",
                desc: "Tous nos véhicules sont certifiés et bénéficient d'une garantie complète jusqu'à 5 ans.",
              },
              {
                icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />,
                title: "Financement Rapide",
                desc: "Solutions de financement flexibles avec réponse en moins de 24 heures.",
              },
              {
                icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />,
                title: "Service VIP",
                desc: "Accompagnement personnalisé par nos experts automobile dédiés.",
                extra: "sm:col-span-2 md:col-span-1",
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 hover:border-red-500/50 transition-colors duration-300 ${service.extra || ""}`}
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
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDI0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-white">
                Prêt à Conduire Votre Rêve ?
              </h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
                Contactez-nous dès maintenant et obtenez un devis personnalisé
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 rounded-full font-bold hover:bg-gray-100 transition text-sm sm:text-base">
                  Prendre Rendez-vous
                </button>
                <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-full font-bold hover:bg-white/30 transition text-sm sm:text-base">
                  Nous Contacter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6 mt-20">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">D</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold">Djib DRive</div>
                        <div className="text-xs text-gray-400">
                          Premium Dealership
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Votre destination premium pour l'achat de véhicules d'exception.
                    </p>
                  </div>
      
                  <div>
                    <h3 className="font-bold mb-4">Navigation</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Accueil
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Nos Voitures
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Services
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:text-white transition">
                          À propos
                        </a>
                      </li>
                    </ul>
                  </div>
      
                  <div>
                    <h3 className="font-bold mb-4">Services</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Financement
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Assurance
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Reprise
                        </a>
                      </li>
                      <li>
                        <a href="#" className="hover:text-white transition">
                          Maintenance
                        </a>
                      </li>
                    </ul>
                  </div>
      
                  <div>
                    <h3 className="font-bold mb-4">Contact</h3>
                    <ul className="space-y-3 text-gray-400 text-sm">
                      <li className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>+253 25313664</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>contact@Djib Drive.dj</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Djibouti City, Djibouti</span>
                      </li>
                    </ul>
                  </div>
                </div>
      
                <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                  <p>&copy; 2024 Djib Drive. Tous droits réservés.</p>
                </div>
              </div>
            </footer>
        

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