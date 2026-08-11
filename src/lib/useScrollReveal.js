import { useEffect, useRef } from "react";

export default function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    let observer;

    const timer = setTimeout(() => {
      const container = ref.current;
      if (!container) return;

      const elements = container.querySelectorAll(".animate-on-scroll");
      if (elements.length === 0) return;

      if (!("IntersectionObserver" in window)) {
        elements.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05 }
      );

      elements.forEach((el) => observer.observe(el));

      // Fallback: if IO doesn't fire within 2s, reveal everything
      setTimeout(() => {
        container.querySelectorAll(".animate-on-scroll:not(.is-visible)").forEach((el) => {
          el.classList.add("is-visible");
        });
      }, 2000);
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  return ref;
}
