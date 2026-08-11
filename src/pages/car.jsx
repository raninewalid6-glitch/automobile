import { useEffect, useMemo, useState } from "react";
import { fetchPublicCars } from "../lib/publicCars";
import React from "react";

import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Filterbar from "../components/filterbar";
import Card from "../components/card";
import Connexion from "../components/login";
import Reservation from "../components/reservation";
import Paiement from "../components/paiement";
import CarDetailsModal from "../components/detailsmodal";
import { useAuth } from "../context/userContext";
import { useLang } from "../lib/i18n";
import useScrollReveal from "../lib/useScrollReveal";

export default function Cars() {
  const { isAuthenticated } = useAuth();
  const { t } = useLang();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchPublicCars()
      .then(setCars)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCar, setDetailsCar] = useState(null);
  const scrollRef = useScrollReveal();

  const filteredCars = useMemo(() => cars.filter((car) => {
    if (selectedCategory !== "all" && car.category !== selectedCategory) return false;
    if (selectedBrand !== "all" && car.brand !== selectedBrand) return false;
    if (priceRange !== "all" && !car.price) return false;
    if (priceRange === "low" && car.price > 150000) return false;
    if (priceRange === "mid" && (car.price < 150000 || car.price > 200000)) return false;
    if (priceRange === "high" && car.price < 200000) return false;
    return true;
  }), [cars, selectedCategory, selectedBrand, priceRange]);

  const brands = [...new Set(cars.map((car) => car.brand))];
  const categories = [...new Set(cars.map((car) => car.category))];

  const handleShowDetails = (car) => {
    setDetailsCar(car);
    setShowDetailsModal(true);
  };

  const handleReserveFromDetails = () => {
    setShowDetailsModal(false);
    handleReserveClick(detailsCar);
  };

  const handleReserveClick = (car) => {
    setSelectedCar(car);
    if (isAuthenticated) {
      setShowReservationModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar setShowLoginModal={setShowLoginModal} />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 animate-on-scroll">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t("cars.title1")}{" "}
            <span className="text-red-500">{t("cars.title2")}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {loading ? t("cars.loading") : `${filteredCars.length} ${t("cars.available")}`}
          </p>
          {loadError && (
            <p className="mt-4 inline-block rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
              {loadError}
            </p>
          )}
        </div>
      </section>

      <Filterbar
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        brands={brands}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      <Card
        filteredCars={filteredCars}
        handleReserveClick={handleReserveClick}
        onShowDetails={handleShowDetails}
      />

      <Connexion
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        selectedCar={selectedCar}
        setShowReservationModal={setShowReservationModal}
      />

      <CarDetailsModal
        showModal={showDetailsModal}
        setShowModal={setShowDetailsModal}
        selectedCar={detailsCar}
        onReserve={handleReserveFromDetails}
        onLoginRequired={() => {
          setShowDetailsModal(false);
          setShowLoginModal(true);
        }}
      />

      <Reservation
        showReservationModal={showReservationModal}
        setShowReservationModal={setShowReservationModal}
        selectedCar={selectedCar}
        setShowPaymentModal={setShowPaymentModal}
        setReservationData={setReservationData}
        setTotalPrice={setTotalPrice}
      />

      <Paiement
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        reservationData={reservationData}
        selectedCar={selectedCar}
        totalPrice={totalPrice}
      />

      <Footer />
    </div>
  );
}