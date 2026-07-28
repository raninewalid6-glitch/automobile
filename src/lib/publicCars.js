// Récupère les voitures publiques depuis l'API et les adapte
// au format attendu par les composants du site (Card, modals...)
import { apiFetch } from "./api";
import { categoryLabels, transmissionLabels, fuelTypeLabels } from "../admin/lib/carOptions";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800";

export function toPublicCar(car) {
  const transmission = transmissionLabels[car.transmission] ?? car.transmission;

  return {
    id: car.id,
    name: car.title,
    brand: car.brand,
    category: categoryLabels[car.category] ?? car.category,
    price: car.salePrice,               // null si la voiture n'est pas à vendre
    pricePerDay: car.rentPricePerDay,   // null si pas à louer
    available: car.isForRent,
    isForSale: car.isForSale,
    image: car.images[0] ?? FALLBACK_IMAGE,
    images: car.images,
    year: car.year,
    km: car.mileage,
    city: car.city,
    transmission,
    color: car.color,
    specs: {
      seats: car.seats,
      doors: car.doors,
      fuel: fuelTypeLabels[car.fuelType] ?? car.fuelType,
      ac: car.airConditioning ? "Oui" : "Non",
      transmission,
    },
    features: [
      car.airConditioning ? "Climatisation" : null,
      `${car.seats} places`,
      `${car.doors} portes`,
      car.color ? `Couleur ${car.color}` : null,
    ].filter(Boolean),
  };
}

export async function fetchPublicCars() {
  const data = await apiFetch("/cars");
  return data.cars.map(toPublicCar);
}
