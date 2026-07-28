import { Check, Star } from "lucide-react";
import React, { useState } from "react";

const PAGE_SIZE = 6;

function Card({ filteredCars, handleReserveClick, onShowDetails }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFilteredCars, setPreviousFilteredCars] = useState(filteredCars);

  // Revient à la page 1 quand la liste filtrée change (recherche/filtres),
  // ajusté pendant le rendu plutôt que dans un effect pour éviter un rendu en cascade.
  if (filteredCars !== previousFilteredCars) {
    setPreviousFilteredCars(filteredCars);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));

  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-500 dark:text-gray-400">
            {filteredCars.length} véhicule{filteredCars.length > 1 ? "s" : ""}{" "}
            trouvé{filteredCars.length > 1 ? "s" : ""}
          </p>
          <select className="bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors duration-300">
            <option>Plus récent</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
            <option>Kilométrage</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCars.map((car) => (
            <div key={car.id} className="group relative">
              <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />

                  <div className="absolute top-4 left-4">
                    {car.available ? (
                      <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Disponible
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                        Vendu
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4">
                    <button className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-600 transition text-white">
                      <Star className="w-5 h-5" />
                    </button>
                  </div>

                  {car.km === 0 && (
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-orange-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                        Neuf
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-red-500 font-semibold">{car.category}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{car.brand}</span>
                  </div>

                  <h3
                    onClick={() => onShowDetails(car)}
                    className="text-xl font-bold mb-4 cursor-pointer group-hover:text-red-500 transition"
                  >
                    {car.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Places", value: car.specs.seats },
                      { label: "Portes", value: car.specs.doors },
                      { label: "Carburant", value: car.specs.fuel },
                      { label: "Climatisation", value: car.specs.ac },
                    ].map((spec) => (
                      <div key={spec.label} className="bg-gray-100 dark:bg-black/50 rounded-lg p-3 transition-colors duration-300">
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{spec.label}</div>
                        <div className="font-semibold text-sm">{spec.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span>{car.year}</span>
                    <span>•</span>
                    <span>{car.km != null ? `${car.km.toLocaleString()} km` : "km n/c"}</span>
                    <span>•</span>
                    <span>{car.transmission}</span>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                    <div className="text-sm font-semibold text-orange-500">
                      {car.pricePerDay != null ? `${car.pricePerDay.toLocaleString()} FDJ/jour` : "Non proposée"}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prix d'achat</div>
                      <div className="text-2xl font-bold text-red-500">
                        {car.price != null ? `${car.price.toLocaleString()} FDJ` : "—"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onShowDetails(car)}
                        className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-500 transition"
                      >
                        Détails
                      </button>
                      {car.available ? (
                        <button
                          onClick={() => handleReserveClick(car)}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
                        >
                          Réserver
                        </button>
                      ) : (
                        <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-semibold cursor-not-allowed opacity-50">
                          Indisponible
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/10 dark:disabled:hover:bg-white/10"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={
                  page === currentPage
                    ? "px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-semibold"
                    : "px-4 py-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition"
                }
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/10 dark:disabled:hover:bg-white/10"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Card;