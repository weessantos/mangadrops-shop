import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home-hero.css";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

export default function HomeHero({ onHeroSearch, isHeaderCompact }) {
  const navigate = useNavigate();
  const slides = useMemo(
    () => [
      {
        src: img("banner-0.jpeg"),
        alt: "Mangá Drops banner",
        position: "center center",
      },
      {
        src: img("banner-1.jpeg"),
        alt: "One Piece",
        title: "One Piece",
        subtitle: "Já está disponível",
        description: "Vídeos de One Piece em breve no Mangá Drops",
        ctaLabel: "Ver One Piece",
        cta: { type: "series", slug: "one-piece" },
        position: "90% center",
      },
      {
        src: img("banner-6.jpeg"),
        alt: "Kagurabachi",
        title: "Kagurabachi",
        subtitle: "Já está disponível",
        description: "Anime anunciado, mangá atualizado somente no Mangá Drops",
        ctaLabel: "Kagurabachi já disponível",
        cta: { type: "series", slug: "kagurabachi" },
        position: "92% center",
      },
      {
        src: img("banner-2.jpeg"),
        alt: "Jujutsu Kaisen",
        title: "Jujutsu Kaisen",
        subtitle: "Já está disponível.",
        description: "Jujutsu Kaisen, completo e atualizado, somente no Mangá Drops",
        ctaLabel: "Ver Jujutsu Kaisen",
        cta: { type: "series", slug: "jujutsu-kaisen" },
        position: "82% center",
      },
      {
        src: img("banner-3.jpeg"),
        alt: "Attack on Titan",
        title: "Attack on Titan",
        subtitle: "Já está disponível.",
        description: "Todos os volumes de Attack on Titan, somente no Mangá Drops",
        ctaLabel: "Ver Attack on Titan",
        cta: { type: "series", slug: "attack-on-titan" },
        position: "90% center",
      },
      {
        src: img("banner-4.jpeg"),
        alt: "Demon Slayer",
        title: "Demon Slayer",
        subtitle: "Em breve.",
        description: "Demon Slayer, incluindo versão com o box",
        ctaLabel: "Solicitar uma obra",
        cta: { type: "url", value: "https://forms.gle/Vz1PUw5V9TxSUzqc8" },
        position: "80% center",
      },
      {
        src: img("banner-5.jpeg"),
        alt: "Notion",
        title: "Organize sua coleção",
        subtitle: "Em breve",
        description: "Template para membros.",
        ctaLabel: "Entrar na lista",
        cta: { type: "url", value: "https://forms.gle/hWzYHck2xPsNRcee9" },
        position: "85% center",
      },
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // ===== Swipe =====
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  // autoplay
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, slides.length]);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return; // swipe só no touch
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    setPaused(true);
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // se foi mais vertical, é scroll (não troca slide)
    if (Math.abs(dy) > Math.abs(dx)) {
      setPaused(false);
      return;
    }

    const threshold = 40;
    if (dx > threshold) prev();
    else if (dx < -threshold) next();

    setPaused(false);
  };

  const onPointerCancel = () => {
    dragging.current = false;
    setPaused(false);
  };

  // ✅ CTA do slide (limpo e único)
  const handleCTA = (slide) => {
    const action = slide?.cta;
    if (!action) return;

    setPaused(true);

    if (action.type === "url") {
      window.open(action.value, "_blank", "noreferrer");
      setTimeout(() => setPaused(false), 200);
      return;
    }

    if (action.type === "scroll") {
      document.getElementById(action.value)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => setPaused(false), 200);
      return;
    }

    if (action.type === "search") {
      if (typeof onHeroSearch === "function") onHeroSearch(action.value);

      setTimeout(() => {
        const target =
          document.getElementById("volumes") ||
          document.getElementById("obras");

        target?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        setPaused(false);
      }, 80);

      return;
    }
    if (action.type === "series") {
      navigate(`/${action.slug}`, { state: { scrollTo: "collection-hero" } });
    }
    setPaused(false);
  };

  return (
    <section className={`heroPremium ${isHeaderCompact ? "compact" : ""}`}>
      <div
        className="heroContainerPremium"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{ touchAction: "pan-y" }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.alt || i}
            className={`heroSlidePremium ${i === index ? "active" : ""}`}
            aria-hidden={i !== index}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              style={{ objectPosition: slide.position || "center" }}
              loading={i === 0 ? "eager" : "lazy"}
            />

            {(slide.title ||
              slide.subtitle ||
              slide.description ||
              (slide.cta && slide.ctaLabel)) && (
              <div className="heroTextWrapper">
                <div className="heroTextCard">
                  {slide.title && <h1>{slide.title}</h1>}
                  {slide.subtitle && <h3>{slide.subtitle}</h3>}
                  {slide.description && <p>{slide.description}</p>}

                  {slide.cta && slide.ctaLabel && (
                    <button
                      className="heroCTA"
                      type="button"
                      onClick={() => handleCTA(slide)}
                    >
                      {slide.ctaLabel}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* setas somem no mobile via CSS */}
        <button
          className="heroArrowPremium left"
          onClick={prev}
          type="button"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          className="heroArrowPremium right"
          onClick={next}
          type="button"
          aria-label="Próximo"
        >
          ›
        </button>

        <div className="heroDotsPremium" aria-hidden="true">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
