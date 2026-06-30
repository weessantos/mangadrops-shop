import { useEffect, useRef } from "react";

export default function ALLandingScroller() {
  const currentSection = useRef(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    const sections = [...document.querySelectorAll(".landing-slide")];

    if (!sections.length) return;

    const goToSection = (index) => {
      window.scrollTo({
        top: sections[index].offsetTop,
        behavior: "smooth",
      });
    };

    // Desabilita o snap em tablets e celulares
    if (window.innerWidth <= 1280) {
      return;
    }

    const handleWheel = (event) => {
      if (isAnimating.current) {
        event.preventDefault();
        return;
      }

      const direction = Math.sign(event.deltaY);

      if (!direction) return;

      const next = Math.max(
        0,
        Math.min(currentSection.current + direction, sections.length - 1),
      );

      if (next === currentSection.current) return;

      event.preventDefault();

      currentSection.current = next;
      isAnimating.current = true;

      goToSection(next);

      setTimeout(() => {
        isAnimating.current = false;
      }, 700);
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return null;
}
