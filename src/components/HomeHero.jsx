import { useEffect, useState } from "react";

export default function HomeHero() {
  const slides = [
    {
      src: "/assets/banner-1.jpeg",
      alt: "One Piece",
      title: "One Piece",
      subtitle: "Já está disponível",
      description: "Acompanhe Luffy e seus amigos nessa jornada épica.",
    },
    {
      src: "/assets/banner-2.jpeg",
      alt: "Jujutsu Kaisen",
      title: "Jujutsu Kaisen",
      subtitle: "Já está disponível.",
      description: "O jogo do abate começou. O caos é inevitável.",
    },
    {
      src: "/assets/banner-3.jpeg",
      alt: "Attack on Titan",
      title: "Attack on Titan",
      subtitle: "Já está disponível.",
      description: "A batalha final se aproxima além das muralhas.",
    },
    {
      src: "/assets/banner-4.jpeg",
      alt: "Demon Slayer",
      title: "Demon Slayer",
      subtitle: "Em breve.",
      description: "Demon Slayer, incluindo versão com o box",
    },
    {
      src: "/assets/banner-5.jpeg",
      alt: "Notion",
      title: "Organize sua coleção",
      subtitle: "Em breve",
      description: "Template para membros.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused, slides.length]);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  return (
    <section className="heroPremium">
      <div
        className="heroContainerPremium"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`heroSlidePremium ${i === index ? "active" : ""}`}
          >
            <img src={slide.src} alt={slide.alt} />

            {/* ✅ TEXTO DENTRO DE UM CARD (melhor legibilidade) */}
            <div className="heroTextWrapper">
              <div className="heroTextCard">
                <h1>{slide.title}</h1>
                <h3>{slide.subtitle}</h3>
                <p>{slide.description}</p>
                <button className="heroCTA" type="button">
                  Explorar agora
                </button>
              </div>
            </div>
          </div>
        ))}

        <button className="heroArrowPremium left" onClick={prev} type="button">
          ‹
        </button>
        <button className="heroArrowPremium right" onClick={next} type="button">
          ›
        </button>

        <div className="heroDotsPremium">
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
