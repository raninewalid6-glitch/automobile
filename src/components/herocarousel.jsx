import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Carrousel plein écran du hero : les images glissent en fond avec un léger zoom,
// et le contenu (texte, boutons) passé en children s'affiche par-dessus.
// Chaque slide : { image, title, subtitle }
export default function HeroCarousel({ slides, children }) {
  const [current, setCurrent] = useState(0);

  // Défilement automatique toutes les 5 secondes
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Si la liste de slides change (mock -> vraies voitures), on évite un index hors limites
  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  const goTo = (index) => setCurrent((index + slides.length) % slides.length);
  const activeSlide = slides[current];

  return (
    <section className="relative h-[100svh] sm:h-[85vh] min-h-[500px] overflow-hidden">
      {/* Piste d'images qui glisse horizontalement */}
      <div
        className="absolute inset-0 flex transition-transform duration-[900ms] ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative h-full w-full flex-shrink-0 overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              className={`h-full w-full object-cover ${index === current ? "animate-hero-zoom" : ""}`}
            />
          </div>
        ))}
      </div>

      {/* Voiles sombres pour garder le texte lisible sur les photos */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

      {/* Contenu du hero (texte, boutons) par-dessus les images */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Légende de la slide active : nom + prix de la voiture */}
      {activeSlide?.title && (
        <div className="absolute bottom-14 right-3 sm:bottom-20 sm:right-8 z-10 max-w-[55%] sm:max-w-[60%] text-right pointer-events-none">
          <p className="truncate text-sm font-bold text-white drop-shadow sm:text-2xl">{activeSlide.title}</p>
          {activeSlide.subtitle && (
            <p className="text-xs font-semibold text-orange-300 sm:text-base">{activeSlide.subtitle}</p>
          )}
        </div>
      )}

      {slides.length > 1 && (
        <>
          {/* Flèches */}
          <button
            onClick={() => goTo(current - 1)}
            aria-label="Slide précédente"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-red-600 sm:left-5"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            aria-label="Slide suivante"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-red-600 sm:right-5"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Points de navigation */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                aria-label={`Aller à la slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${index === current ? "w-7 bg-red-500" : "w-2.5 bg-white/50 hover:bg-white"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
