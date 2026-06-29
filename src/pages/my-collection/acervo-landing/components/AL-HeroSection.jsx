import { useEffect, useMemo, useRef, useState } from "react";
import useALHeroEngine from "../../../../hooks/my-collection-hooks/acervo-landing/al-hero-engine.js";
import "../../../../styles/my-collection/acervo-landing/components/al-hero-section.css";

const slides = [
  {
    id: "home",
    title: "Organize sua coleção de mangás.",
    subtitle:
      "Catalogue seus volumes, acompanhe seu progresso e tenha todo o seu acervo em um único lugar.",

    image: "/assets/my-collection/landing/home.webp",

    accent: "#5314e7",
  },

  {
    id: "series",
    title: "Sua coleção, do seu jeito.",
    subtitle:
      "Marque os volumes que você já possui, acompanhe os que faltam, organize sua wishlist e visualize o progresso de cada coleção em um único lugar.",

    image: "/assets/my-collection/landing/collection.webp",

    accent: "#2966ea",
  },
  {
    id: "public",
    title: "Compartilhe seu perfil.",
    subtitle:
      "Mostre sua coleção completa para outros colecionadores através do seu perfil público.",

    image: "/assets/my-collection/landing/public-profile.webp",

    accent: "#EF4444",
  },

  {
    id: "profile",

    title: "Muito mais que uma coleção.",

    subtitle:
      "Seu perfil reúne tudo em um só lugar: níveis, ranks, estatísticas, fidelidade, conquistas e uma identidade única construída volume após volume.",

    image: "/assets/my-collection/landing/profile.webp",

    accent: "#ca6a03",
  },

  {
    id: "achievements",
    title: "Desbloqueie conquistas.",
    subtitle:
      "Ganhe novas medalhas conforme sua coleção cresce e evolua seu nível de colecionador.",

    image: "/assets/my-collection/landing/achievements.webp",

    accent: "#a27c09",
  },

  {
    id: "avatar",
    title: "Personalize seu perfil.",
    subtitle: "Escolha avatar, banner e deixe seu perfil com a sua identidade.",

    image: "/assets/my-collection/landing/avatars.webp",

    accent: "#0c5147",
  },
];

export default function ALHeroSection() {
  const heroEngine = useALHeroEngine(slides);

  const {
    heroRef,
    stageRef,
    glowRef,
    lightRef,

    registerCard,

    activeSlide,
    currentSlide,
    textEntering,
  } = heroEngine;

  // ===============================
  // PHYSICS
  // ===============================

  function physics() {
    const e = engine.current;

    e.mouse.x += (e.target.x - e.mouse.x) * 0.08;
    e.mouse.y += (e.target.y - e.mouse.y) * 0.08;

    e.velocity.x *= 0.92;
    e.velocity.y *= 0.92;

    e.velocity.x += (e.target.x - e.mouse.x) * 0.03;
    e.velocity.y += (e.target.y - e.mouse.y) * 0.03;

    e.floating += 0.015;

    // ======================
    // Slider Physics
    // ======================

    e.slideProgress += (e.slideTarget - e.slideProgress) * 0.08;

    const rounded = Math.round(e.slideProgress);

    if (rounded !== e.slideCurrent) {
      e.slideCurrent = rounded;

      setActiveSlide(rounded);
    }
  }

  // ===============================
  // ANIMATION POSITION
  // ===============================

  function getAnimatedPosition(index) {
    const e = engine.current;

    const total = slides.length;

    let diff = index - e.slideProgress;

    if (diff > total / 2) diff -= total;

    if (diff < -total / 2) diff += total;

    return diff;
  }

  // ===============================
  // RENDER
  // ===============================

  function render() {
    const e = engine.current;

    if (!stageRef.current) return;

    // Floating contínuo
    const floatY = Math.sin(e.floating) * 6;

    // Velocidade do mouse (usaremos em vários efeitos)
    const velocity = Math.abs(e.velocity.x) + Math.abs(e.velocity.y);

    // ==========================
    // GLOW
    // ==========================

    if (glowRef.current) {
      const blur = 120 + velocity * 50;

      glowRef.current.style.transform = `
      translate(
        calc(-50% + ${e.mouse.x * 32}px),
        calc(-50% + ${e.mouse.y * 24}px)
      )
      scale(${1 + velocity * 0.45})
    `;

      glowRef.current.style.filter = `blur(${blur}px)`;
    }

    // ==========================
    // LIGHT
    // ==========================

    if (lightRef.current) {
      const pulse = 1 + Math.sin(e.floating * 0.7) * 0.04;

      const intensity =
        0.16 + Math.abs(e.mouse.x) * 0.06 + Math.abs(e.mouse.y) * 0.05;

      lightRef.current.style.transform = `
    translate(
      calc(-50% + ${e.mouse.x * 120}px),
      calc(-50% + ${e.mouse.y * 90}px)
    )
    scale(${pulse})
  `;

      lightRef.current.style.opacity = intensity;
    }

    // ==========================
    // STAGE
    // ==========================

    stageRef.current.style.transform = `
    translate3d(
      ${e.mouse.x * 18}px,
      ${e.mouse.y * 14 + floatY}px,
      0
    )
    rotateX(${e.mouse.y * -5}deg)
    rotateY(${e.mouse.x * 9}deg)
  `;
  }

  function renderCards() {
    const e = engine.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const position = getAnimatedPosition(index);

      const leavingCenter = position < 0 && position > -1;

      const abs = Math.abs(position);

      // =====================
      // ÓRBITA
      // =====================

      const radius = 430;

      const spread = 38; // graus entre cards

      let orbitPosition = position;

      if (position > -1 && position < 0) {
        orbitPosition = -1 - (1 + position);
      }

      const angle = orbitPosition * spread;

      const rad = (angle * Math.PI) / 180;

      const orbitX = Math.sin(rad) * radius;

      const orbitZ = (Math.cos(rad) - 1) * radius;

      const rotate = -angle;

      const scale = 1 - Math.abs(orbitZ) / 1800;

      const x = orbitX + e.mouse.x * 12;

      const y = e.mouse.y * 8;

      card.style.transform = `
        translate(-50%, -50%)
        translate3d(${x}px, ${y}px, ${orbitZ}px)
        rotateY(${rotate}deg)
        scale(${scale})
      `;

      card.style.opacity = abs > 2 ? 0 : 1;

      card.style.zIndex = 100 - abs;

      card.style.filter = `
      blur(${abs * 1.5}px)
      brightness(${1 - abs * 0.12})
    `;
    });
  }

  function renderReflection() {
    const e = engine.current;

    cardRefs.current.forEach((card) => {
      if (!card) return;

      const reflection = card.querySelector(".al-card-reflection");

      if (!reflection) return;

      reflection.style.transform = `
      translateX(${e.mouse.x * 80}px)
      translateY(${e.mouse.y * 40}px)
      rotate(18deg)
    `;

      reflection.style.opacity = 0.08 + Math.abs(e.mouse.x) * 0.06;
    });
  }

  return (
    <section
      ref={heroRef}
      className="al-hero"
      style={{
        "--accent": currentSlide.accent,
      }}
    >
      <header className="al-hero-header">
        <img src="/assets/logo.png" alt="Mangá Drops" />

        <div className="al-hero-actions">
          <button>Entrar</button>

          <button>Criar conta</button>
        </div>
      </header>

      <div className="al-hero-layout">
        <div className="al-hero-copy">
          {/* <span className={`al-hero-tag ${textEntering ? "text-enter" : ""}`}>
            {String(activeSlide + 1).padStart(2, "0")}

            <span>/ {String(slides.length).padStart(2, "0")}</span>
          </span> */}

          <h1 className={textEntering ? "text-enter delay-1" : ""}>
            {currentSlide.title}
          </h1>

          <p className={textEntering ? "text-enter delay-2" : ""}>
            {currentSlide.subtitle}
          </p>

          <div
            className={`al-hero-buttons ${
              textEntering ? "text-enter delay-3" : ""
            }`}
          >
            <button className="primary">Criar conta gratuitamente</button>

            <button>Já tenho conta</button>
          </div>
        </div>

        <div className="al-stage-wrapper">
          <div ref={glowRef} className="al-stage-glow" />
          <div ref={lightRef} className="al-stage-light" />
          <div
            ref={stageRef}
            className="al-stage"
            style={{
              "--accent": currentSlide.accent,
            }}
          >
            {slides.map((slide, index) => {
              return (
                <div
                  key={slide.id}
                  ref={(el) => registerCard(el, index)}
                  className="al-stage-card"
                >
                  <div className="al-card-shadow" />

                  <div className="al-card-reflection" />

                  <div className="al-card-border" />

                  <img src={slide.image} alt={slide.title} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
